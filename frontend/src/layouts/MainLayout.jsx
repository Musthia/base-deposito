import { useState } from "react";
import Sidebar from "./Sidebar";

import GlobalSearchBar from "../components/GlobalSearchBar";
import SearchResultsTab from "../tabs/SearchResultsTab";

export default function MainLayout() {
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState(null);

    const handleSearchResults = ({ query, schema, results }) => {

        if (!results || results.length === 0) {
            return;
        }

        const tabId = `search_${schema}_${query}`;

        setTabs((prev) => {
            const exists = prev.find(t => t.id === tabId);

            if (exists) {
                setActiveTab(tabId);
                return prev;
            }

            return [
                ...prev,
                {
                    id: tabId,
                    title: `Resultados (${schema})`,
                    component: (
                        <SearchResultsTab
                            query={query}
                            schema={schema}
                            results={results}
                        />
                    )
                }
            ];
        });

        setActiveTab(tabId);
    };

    // 🔹 Abrir tab (evita duplicados)
    const openTab = (tab) => {
        setTabs((prev) => {
            const exists = prev.find(t => t.id === tab.id);

            if (exists) {
                setActiveTab(tab.id);
                return prev;
            }

            return [...prev, tab];
        });

        setActiveTab(tab.id);
    };

    // 🔹 Cerrar tab
    const closeTab = (tabId) => {
        setTabs((prev) => {
            const filtered = prev.filter(t => t.id !== tabId);

            // si cerramos la activa, mover foco
            if (activeTab === tabId && filtered.length > 0) {
                setActiveTab(filtered[filtered.length - 1].id);
            }

            return filtered;
        });
    };

    // 🔹 Render contenido activo
    const renderActiveTab = () => {
        const tab = tabs.find(t => t.id === activeTab);
        if (!tab) return <div style={{ padding: 20 }}>Sin pestañas abiertas</div>;

        return tab.component;
    };

    return (
        <div style={styles.container}>
                {/* BARRA DE BÚSQUEDA GLOBAL */}
            <GlobalSearchBar onResults={handleSearchResults} />

            {/* SIDEBAR */}
            <Sidebar openTab={openTab} />

            {/* AREA CENTRAL */}
            <div style={styles.main}>

                {/* TABS HEADER */}
                <div style={styles.tabsBar}>
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            style={{
                                ...styles.tab,
                                background: tab.id === activeTab ? "#3b3b55" : "#2a2a3d"
                            }}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span>{tab.title}</span>

                            {/* ❌ cerrar */}
                            <button
                                style={styles.closeBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(tab.id);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {/* CONTENIDO */}
                <div style={styles.content}>
                    {renderActiveTab()}
                </div>

            </div>
        </div>
    );
}

        const styles = {
            container: {
                display: "flex",
                height: "100vh",
                fontFamily: "Arial"
            },
        
            main: {
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background: "#1a1a26"
            },
        
            tabsBar: {
                display: "flex",
                background: "#222235",
                padding: "5px",
                gap: "5px",
                overflowX: "auto"
            },
        
            tab: {
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                whiteSpace: "nowrap"
            },
        
            closeBtn: {
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "14px"
            },
        
            content: {
                flex: 1,
                padding: "15px",
                background: "#151520",
                color: "white"
            }
        };