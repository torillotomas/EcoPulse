import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/authSchemas";
import type { LoginSchemaType } from "../schemas/authSchemas";
import { apiClient } from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            recordarme: false,
        },
    });

    const onFormSubmit: SubmitHandler<LoginSchemaType> = async (data) => {
        try {
            const body = { email: data.email, password: data.password };
            const response = await apiClient<{ access_token: string }>(
                "/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );
            useAuthStore.getState().login(response.access_token);
        } catch (error) {
            if (error instanceof Error) {
                setError("root", { message: error.message });
            } else {
                setError("root", { message: "Error desconocido" });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)}>
        {/* Campo Email */}
        <div>
            <label htmlFor="email">Email</label>
            <input
                id="email"
                type="email"
                {...register("email")}
            />
            {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
        </div>

        {/* Campo Password */}
        <div>
            <label htmlFor="password">Contraseña</label>
            <input
                id="password"
                type="password"
                {...register("password")}
            />
            {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
        </div>

        {/* Campo Checkbox Recordarme */}
        <div>
            <label>
                <input
                    type="checkbox"
                    {...register("recordarme")}
                />
                Recordarme en este equipo
            </label>
        </div>

        {/* Errores del servidor */}
        {errors.root?.message && <p style={{ color: "red" }}>{errors.root.message}</p>}

        <button type="submit">Iniciar Sesión</button>
    </form>
);
}