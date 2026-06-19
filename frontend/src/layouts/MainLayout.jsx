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
        
            if (activeTab === tabId) {
                if (filtered.length > 0) {
                    setActiveTab(filtered[filtered.length - 1].id);
                } else {
                    setActiveTab(null);
                }
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

            {/* SIDEBAR */}
            <Sidebar openTab={openTab} />

            {/* MAIN AREA */}
            <div style={styles.main}>

                {/* TOP BAR (BUSCADOR) */}
                <GlobalSearchBar onResults={handleSearchResults} />

                {/* TABS */}
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
                            {tab.title}

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

                {/* CONTENT */}
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
                gap: "10px",
                padding: "10px",
                background: "#1e1e2f",
                position: "sticky",
                top: 0,
                zIndex: 10
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