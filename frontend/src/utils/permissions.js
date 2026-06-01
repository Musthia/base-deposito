export const can = (user, action) => {
    if (!user) return false;

    if (user.superusuario) return true;

    const nivel = user.nivel;

    switch (action) {

        case "CREATE_USER":
            return nivel >= 5000;

        case "EDIT_USER":
            return nivel >= 5000;

        case "DELETE_USER":
            return nivel >= 9000;

        case "VIEW_USERS":
            return nivel >= 1000;

        default:
            return false;
    }
};