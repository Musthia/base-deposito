import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    IconButton,
    Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { listarBases, consultarBase, buscarEnBase } from "../services/databaseService";
import EditRecordModal from "../components/modals/EditRecordModal";
import { useTabs } from "../context/TabContext";

export default function DatabasePage() {
    const [bases, setBases] = useState([]);
    const [baseActual, setBaseActual] = useState("");
    const [criterio, setCriterio] = useState("");
    const [loading, setLoading] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const { tabs, tabIndex, setTabIndex, agregarTab, cerrarTab, actualizarFila } = useTabs();

    useEffect(() => {
        listarBases().then(setBases).catch(console.error);
    }, []);

    const coloresColumnas = {
        n_lote: "#b400ff",
        "hh.cc": "#c819c8",
        expediente: "#c819c8",
        documento: "#00e696",
        denominacion: "#0014ff",
    };

    const construirTab = useCallback((base, modo, columnas, registros, total) => {
        const columns = columnas
            .filter((col) => !col.toLowerCase().startsWith("id_datcorr"))
            .map((col) => ({
                field: col,
                headerName: col,
                flex: 1,
                minWidth: 120,
                cellClassName: () => {
                    const color = coloresColumnas[col.toLowerCase()];
                    if (!color) return "";
                    return `highlight-${col.toLowerCase().replace(/\s+/g, "-")}`;
                },
            }));

        columns.unshift({
            field: "id",
            headerName: "ID",
            width: 80,
            hide: true,
        });

        const rows = registros.map((row, idx) => {
            const rowData = { id: idx };
            columnas.forEach((col, ci) => {
                rowData[col] = row[ci] != null ? String(row[ci]) : "";
            });
            rowData._raw = row;
            rowData._idValue = row[0];
            return rowData;
        });

        return { base, modo, columns, rows, total, columnas };
    }, []);

    const handleConsultar = async () => {
        if (!baseActual) return;
        setLoading(true);
        try {
            const data = await consultarBase(baseActual, { limit: 200 });
            const tab = construirTab(baseActual, "CONSULTA", data.columnas, data.registros, data.total);
            agregarTab(tab);
            setTabIndex(tabs.length);
        } catch (err) {
            console.error("Error consultando:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = async () => {
        if (!baseActual || !criterio.trim()) return;
        setLoading(true);
        try {
            const data = await buscarEnBase(baseActual, criterio.trim(), { limit: 200 });
            const tab = construirTab(baseActual, "BUSQUEDA", data.columnas, data.registros, data.total);
            agregarTab(tab);
            setTabIndex(tabs.length);
        } catch (err) {
            console.error("Error buscando:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleBuscar();
    };

    const handleDoubleClick = (params) => {
        const tab = tabs[tabIndex];
        if (!tab || tab.modo !== "BUSQUEDA") return;
        const row = params.row;
        const valores = tab.columnas.map((col) => row[col]);
        setEditData({
            base: tab.base,
            idRegistro: row._idValue,
            columnas: tab.columnas,
            valores,
            claveTab: tab.clave,
        });
        setEditModalOpen(true);
    };

    const handleEditSaved = (datos) => {
        if (editData && datos) {
            actualizarFila(editData.claveTab, editData.idRegistro, datos);
        }
        setEditModalOpen(false);
        setEditData(null);
    };

    if (!bases.length) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h5">Consultar Bases</Typography>
                <Typography color="text.secondary">Cargando bases disponibles...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Consultar Bases de Datos
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
                <FormControl sx={{ minWidth: 250 }} size="small">
                    <InputLabel>Base de datos</InputLabel>
                    <Select
                        value={baseActual}
                        label="Base de datos"
                        onChange={(e) => setBaseActual(e.target.value)}
                    >
                        {bases.map((b) => (
                            <MenuItem key={`${b.nombre}_${b.tipo}`} value={b.nombre}>
                                {b.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    placeholder="Buscar..."
                    value={criterio}
                    onChange={(e) => setCriterio(e.target.value)}
                    onKeyDown={handleKeyDown}
                    sx={{ minWidth: 300 }}
                />

                <Button variant="contained" onClick={handleBuscar} startIcon={<SearchIcon />}>
                    Buscar
                </Button>

                <Button variant="outlined" onClick={handleConsultar}>
                    Ver todo
                </Button>
            </Box>

            {tabs.length > 0 && (
                <>
                    <Tabs
                        value={Math.min(tabIndex, tabs.length - 1)}
                        onChange={(_, v) => setTabIndex(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {tabs.map((tab, i) => (
                            <Tab
                                key={tab.clave}
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Chip
                                            label={tab.modo}
                                            size="small"
                                            color={tab.modo === "BUSQUEDA" ? "warning" : "info"}
                                            sx={{ height: 20, fontSize: 11 }}
                                        />
                                        <span>{tab.base}</span>
                                        <span style={{ fontSize: 12, opacity: 0.7 }}>
                                            ({tab.total})
                                        </span>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                cerrarTab(i);
                                            }}
                                            sx={{ ml: 0.5 }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                }
                            />
                        ))}
                    </Tabs>

                    <Box sx={{ height: 600, mt: 1 }}>
                        <DataGrid
                            key={tabs[Math.min(tabIndex, tabs.length - 1)]?.clave}
                            rows={tabs[Math.min(tabIndex, tabs.length - 1)]?.rows || []}
                            columns={tabs[Math.min(tabIndex, tabs.length - 1)]?.columns || []}
                            loading={loading}
                            pageSizeOptions={[25, 50, 100]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 50 } },
                            }}
                            onRowDoubleClick={handleDoubleClick}
                            disableRowSelectionOnClick
                            sx={{
                                "& .MuiDataGrid-cell:focus": { outline: "none" },
                            }}
                        />
                    </Box>
                </>
            )}

            {tabs.length === 0 && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 300,
                        color: "text.secondary",
                    }}
                >
                    Seleccione una base y realice una búsqueda o consulta
                </Box>
            )}

            {editModalOpen && editData && (
                <EditRecordModal
                    open={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setEditData(null);
                    }}
                    onSaved={handleEditSaved}
                    base={editData.base}
                    idRegistro={editData.idRegistro}
                    columnas={editData.columnas}
                    valores={editData.valores}
                />
            )}
        </Box>
    );
}
