class DatabaseRouter:

    # -----------------------------------
    # MODO ACTUAL DEL SISTEMA
    # -----------------------------------

    MODE = "POSTGRES"  # futuro default

    # -----------------------------------
    # SWITCH CONTROLADO
    # -----------------------------------

    @classmethod
    def set_mode(cls, mode: str):

        cls.MODE = mode

    # -----------------------------------
    # OBTENER MOTOR ACTUAL
    # -----------------------------------

    @classmethod
    def get_mode(cls):

        return cls.MODE

    # -----------------------------------
    # DECISIÓN DE CONEXIÓN
    # -----------------------------------

    @classmethod
    def is_postgres(cls):

        return cls.MODE == "POSTGRES"

    @classmethod
    def is_sqlite(cls):

        return cls.MODE == "SQLITE"