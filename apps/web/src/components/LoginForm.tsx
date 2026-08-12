import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/authSchemas";
import type { LoginSchemaType } from "../schemas/authSchemas";

export function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            recordarme: false,
        },
    });

    const onFormSubmit: SubmitHandler<LoginSchemaType> = (data) => {
        console.log("Datos válidos enviados:", data);
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

        <button type="submit">Iniciar Sesión</button>
    </form>
);
}