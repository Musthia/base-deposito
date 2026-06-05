def get_usuario_attr(usuario, key, default=None):
    if isinstance(usuario, dict):
        return usuario.get(key, default)
    return getattr(usuario, key, default)