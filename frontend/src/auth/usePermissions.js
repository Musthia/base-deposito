import { useAuthStore } from "./authStore";

export const usePermissions = () => {

    const user = useAuthStore((s) => s.user);

    // 🔥 FALLBACK DE SEGURIDAD
    if (!user) {
        return {
            canViewUsers: false,
            canViewAuditoria: false,
            canViewReportes: false,
            canViewDatabase: false,
            canViewCargaDatos: false,
            canViewSimco: false,
            canViewMensajes: false,
            canViewAltasPendientes: false,
            isConsulta: false,
            canCreateUser: false,
            canEditUser: false,
            canDeleteUser: false,
            showNivelColumn: false,
            showRolColumn: false
        };
    }

    const nivel = user.nivel ?? 0;
    const isSuper = user.superusuario ?? false;

    const isAdmin = isSuper || nivel >= 10;

    return {

        canViewUsers: isAdmin,
        canViewAuditoria: isAdmin,
        canViewReportes: nivel >= 5,
        canViewDatabase: nivel >= 3,
        canViewCargaDatos: nivel >= 5,
        canViewSimco: true,
        canViewMensajes: nivel >= 3,
        canViewAltasPendientes: isAdmin,
        isConsulta: nivel === 1,

        canCreateUser: isAdmin,
        canEditUser: isAdmin,
        canDeleteUser: isSuper,

        showNivelColumn: isSuper || nivel >= 5,
        showRolColumn: true
    };
};