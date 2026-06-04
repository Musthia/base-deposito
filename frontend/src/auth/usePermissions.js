import { useAuthStore } from "./authStore";

export const usePermissions = () => {

    const user = useAuthStore((s) => s.user);

    // 🔥 FALLBACK DE SEGURIDAD
    if (!user) {
        return {
            canViewUsers: false,
            canCreateUser: false,
            canEditUser: false,
            canDeleteUser: false,
            showNivelColumn: false,
            showRolColumn: false
        };
    }

    const nivel = user.nivel ?? 0;
    const isSuper = user.superusuario ?? false;

    return {

        canViewUsers: true,

        canCreateUser: isSuper || nivel >= 10,
        canEditUser: isSuper || nivel >= 10,
        canDeleteUser: isSuper,

        showNivelColumn: isSuper || nivel >= 5,
        showRolColumn: true
    };
};