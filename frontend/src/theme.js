import { createTheme } from "@mui/material/styles";

export const COLORS = {
    bgPage: "#0f172a",
    bgCard: "#042164",
    border: "#1e3a8a",
    textMain: "#fdfdfd",
    textMainsort: "#000000",
    textMuted: "#94a3b8",
    primary: "#3b82f6",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444",
};

export const theme = createTheme({
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: COLORS.bgCard,
                    color: COLORS.textMain,
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: COLORS.textMain,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    color: COLORS.textMain,
                    borderBottomColor: COLORS.border,
                },
                head: {
                    color: COLORS.textMain,
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
                    color: COLORS.textMuted,
                    "&.Mui-selected": {
                        color: COLORS.primary,
                    },
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: COLORS.textMain,
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: COLORS.textMuted,
                    "&.Mui-focused": {
                        color: COLORS.primary,
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    color: COLORS.textMain,
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.border,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.primary,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.primary,
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                icon: {
                    color: COLORS.textMuted,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: COLORS.bgCard,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiInputLabel-root": { color: COLORS.textMuted },
                    "& .MuiInputBase-root": { color: COLORS.textMain },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundColor: "#0a1a4a",
                    border: `1px solid ${COLORS.border}`,
                },
                list: {
                    backgroundColor: "#0a1a4a",
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: COLORS.textMain,
                    "&:hover": {
                        backgroundColor: "rgba(59, 130, 246, 0.15)",
                    },
                    "&.Mui-selected": {
                        backgroundColor: "rgba(59, 130, 246, 0.25)",
                    },
                },
            },
        },
        MuiSnackbar: {
            styleOverrides: {
                root: {
                    "& .MuiAlert-root": {
                        backgroundColor: COLORS.bgCard,
                        color: COLORS.textMain,
                    },
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    backgroundColor: COLORS.bgCard,
                    color: COLORS.textMain,
                    borderColor: COLORS.border,
                    "& .MuiDataGrid-cell": {
                        color: COLORS.textMain,
                        borderBottom: `1px solid ${COLORS.border}`,
                        backgroundColor: COLORS.bgCard,
                    },
                    "& .MuiTablePagination-root": {
                        color: COLORS.textMain,
                    },
                    "& .MuiTablePagination-selectIcon": {
                        color: COLORS.textMain,
                    },
                    "& .MuiDataGrid-row:hover": {
                        backgroundColor: "rgba(59, 130, 246, 0.08)",
                    },
                    "& .MuiDataGrid-row.Mui-selected": {
                        backgroundColor: "rgba(59, 130, 246, 0.15)",
                    },
                    "& .MuiDataGrid-sortIcon": {
                        color: COLORS.textMain,
                        opacity: 1,
                        fontSize: 18,
                    },
                    "& .MuiDataGrid-iconButtonContainer": {
                        color: COLORS.textMain,
                        opacity: 1,
                    },
                    "& .MuiDataGrid-columnHeaderTitleContainer": {
                        color: COLORS.textMain,
                    },
                },
                columnHeaders: {
                    backgroundColor: "#1e2a5a",
                    color: COLORS.textMain,
                    fontWeight: 700,
                    fontSize: 13,
                    borderBottom: `2px solid ${COLORS.primary}`,
                },
                columnHeader: {
                    backgroundColor: "#1e2a5a",
                    color: COLORS.textMain,
                    "&:hover": {
                        backgroundColor: "#253a6a",
                    },
                    "&.MuiDataGrid-columnHeader--sorted": {
                        backgroundColor: "#253a6a",
                    },
                },
                columnHeaderTitle: {
                    color: COLORS.textMain,
                    fontWeight: 700,
                },
                footerContainer: {
                    backgroundColor: "#1e2a5a",
                    borderTop: `2px solid ${COLORS.border}`,
                    color: COLORS.textMain,
                },
            },
        },
    },
});
