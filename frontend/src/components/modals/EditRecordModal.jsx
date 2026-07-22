import { useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    Button,
    TextField,
    Snackbar,
    Alert,
} from "@mui/material";
import { actualizarRegistro } from "../../services/databaseService";

function formFromProps(columnas, valores) {
    if (!columnas || !valores) return {};
    const initial = {};
    columnas.forEach((col, i) => {
        initial[col] = valores[i] != null ? String(valores[i]) : "";
    });
    return initial;
}

export default function EditRecordModal({
    open,
    onClose,
    onSaved,
    base,
    idRegistro,
    columnas,
    valores,
}) {
    const [form, setForm] = useState(() => formFromProps(columnas, valores));
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [prevId, setPrevId] = useState(null);

    if (open && idRegistro !== prevId) {
        setPrevId(idRegistro);
        setForm(formFromProps(columnas, valores));
    }

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = {};
            columnas.forEach((col) => {
                if (!col.toLowerCase().startsWith("id_datcorr")) {
                    data[col] = form[col];
                }
            });
            await actualizarRegistro(base, idRegistro, data);
            setSnackbar({ open: true, message: "Registro actualizado correctamente", severity: "success" });
            setTimeout(() => onSaved({ ...form }), 500);
        } catch (err) {
            const msg = err.response?.status === 403
                ? "No tiene permisos para editar registros"
                : "Error al actualizar registro";
            setSnackbar({ open: true, message: msg, severity: "error" });
            onSaved(null, msg);
        } finally {
            setSaving(false);
        }
    };

    const columnasEditables = columnas.filter(
        (col) => !col.toLowerCase().startsWith("id_datcorr") && col.toLowerCase() !== "registro"
    );

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 450, p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Editar Registro - {base}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ID: {idRegistro}
                </Typography>

                {columnasEditables.map((col) => (
                    <TextField
                        key={col}
                        margin="dense"
                        label={col}
                        name={col}
                        fullWidth
                        size="small"
                        value={form[col] || ""}
                        onChange={handleChange}
                        InputProps={{
                            readOnly: false,
                        }}
                    />
                ))}

                <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                        Cancelar
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Drawer>
    );
}
