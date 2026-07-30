import { createTheme } from "@mui/material/styles";

export const TOPBAR = {
    bg: "#1e293b",
    text: "#ffffff",
    activeBg: "#334155",
    height: "56px",
};

export const BORDER_SUBTLE = "#e2e8f0";

export const LIGHT = {
    bgPage: "#0a0e1a",
    bgCard: "#141a2e",
    bgCard1: "#fefeff",
    border: "#2a3050",
    textMain: "#f0f2f5",
    textMain1: "#000005",
    textMuted: "#8896b8",
    primary: "#2563eb",
    success: "#34d399",
    warning: "#f59e0b",
    danger: "#f87171",
};

export const DARK = {
    bgPage: "#1a2040",
    bgCard: "#222a4a",
    border: "#334470",
    textMain: "#f0f2f5",
    textMuted: "#8896b8",
    primary: "#2563eb",
    success: "#34d399",
    warning: "#f59e0b",
    danger: "#f87171",
};

function buildTheme(colors) {
    const isDark = colors.bgPage !== "#f3f4f6";
    return createTheme({
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundColor: colors.bgCard,
                        color: colors.textMain,
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: colors.textMain,
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        color: colors.textMain,
                        borderBottomColor: colors.border,
                    },
                    head: {
                        color: colors.textMain,
                        fontWeight: 700,
                        fontSize: 13,
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        color: "#fff",
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: "none",
                    },
                },
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        color: colors.textMuted,
                        "&.Mui-selected": {
                            color: colors.primary,
                        },
                    },
                },
            },
            MuiTypography: {
                styleOverrides: {
                    root: {
                        color: colors.textMain,
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: colors.textMuted,
                        "&.Mui-focused": {
                            color: colors.primary,
                        },
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        color: colors.textMain,
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.primary,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.primary,
                        },
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    select: {
                        color: colors.textMain,
                    },
                    icon: {
                        color: colors.textMuted,
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: colors.bgCard,
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        "& .MuiInputLabel-root": { color: colors.textMuted },
                        "& .MuiInputBase-root": { color: colors.textMain },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.border },
                    },
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        backgroundColor: colors.bgCard,
                        border: `1px solid ${colors.border}`,
                    },
                    list: {
                        backgroundColor: colors.bgCard,
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        color: colors.textMain,
                        "&:hover": {
                            backgroundColor: isDark ? "waith" : "rgba(243, 236, 236, 0.08)",
                        },
                        "&.Mui-selected": {
                            backgroundColor: isDark ? "rgba(248, 250, 252, 0.22)" : "rgba(245, 246, 248, 0.15)",
                        },
                    },
                },
            },
            MuiSnackbar: {
                styleOverrides: {
                    root: {
                        "& .MuiAlert-root": {
                            backgroundColor: colors.bgCard,
                            color: colors.textMain,
                        },
                    },
                },
            },
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        backgroundColor: colors.bgCard,
                        color: colors.textMain,
                        borderColor: colors.border,
                        "& .MuiDataGrid-cell": {
                            color: colors.textMain,
                            borderBottom: `1px solid ${colors.border}`,
                            backgroundColor: colors.bgCard,
                        },
                        "& .MuiTablePagination-root": {
                            color: colors.textMain,
                        },
                        "& .MuiTablePagination-selectIcon": {
                            color: colors.textMain,
                        },
                        "& .MuiDataGrid-row:hover": {
                            backgroundColor: isDark ? "rgba(96, 165, 250, 0.06)" : "rgba(37, 99, 235, 0.04)",
                        },
                        "& .MuiDataGrid-row.Mui-selected": {
                            backgroundColor: isDark ? "rgba(96, 165, 250, 0.14)" : "rgba(37, 99, 235, 0.10)",
                        },
                        "& .MuiDataGrid-sortIcon": {
                            color: colors.textMain1,
                            opacity: 1,
                            fontSize: 18,
                        },
                        "& .MuiDataGrid-iconButtonContainer": {
                            color: colors.textMain,
                            opacity: 1,
                        },
                        "& .MuiDataGrid-columnHeaderTitleContainer": {
                            color: colors.textMain,
                        },
                    },
                    columnHeaders: {
                        backgroundColor: isDark ? "#363652" : "#f9fafb",
                        color: colors.textMain,
                        fontWeight: 700,
                        fontSize: 13,
                        borderBottom: `2px solid ${colors.border}`,
                    },
                    columnHeader: {
                        backgroundColor: isDark ? "#363652" : "#f9fafb",
                        color: colors.textMain,
                        "&:hover": {
                            backgroundColor: isDark ? "#404060" : "#e5e7eb",
                        },
                        "&.MuiDataGrid-columnHeader--sorted": {
                            backgroundColor: isDark ? "#404060" : "#e5e7eb",
                        },
                    },
                    columnHeaderTitle: {
                        color: colors.textMain,
                        fontWeight: 700,
                    },
                    footerContainer: {
                        backgroundColor: isDark ? "#363652" : "#f9fafb",
                        borderTop: `2px solid ${colors.border}`,
                        color: colors.textMain,
                    },
                },
            },
        },
    });
}

export function getTheme(mode) {
    return buildTheme(mode === "dark" ? DARK : LIGHT);
}
