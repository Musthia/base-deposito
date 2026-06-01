import { useState, useEffect } from "react";

export const UsuarioModal = ({
    open,
    onClose,
    onSave,
    initialData
}) => {

    const [form, setForm] = useState({
        nombre: "",
        usuario: "",
        rol: ""
    });

    useEffect(() => {

        if (initialData) {
            setForm(initialData);
        }

    }, [initialData]);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    if (!open) return null;

    return (
        <div className="modal">

            <div className="modal-content">

                <h3>
                    {initialData ? "Editar Usuario" : "Nuevo Usuario"}
                </h3>

                <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                />

                <input
                    name="usuario"
                    value={form.usuario}
                    onChange={handleChange}
                    placeholder="Usuario"
                />

                <select
                    name="rol"
                    value={form.rol}
                    onChange={handleChange}
                >
                    <option value="Admin">Admin</option>
                    <option value="Operador">Operador</option>
                </select>

                <button onClick={() => onSave(form)}>
                    Guardar
                </button>

                <button onClick={onClose}>
                    Cancelar
                </button>

            </div>

        </div>
    );
};