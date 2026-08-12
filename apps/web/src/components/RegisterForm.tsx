import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RegisterSchemaType } from "../schemas/authSchemas";
import { registerSchema } from "../schemas/authSchemas";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterSchemaType) => {
    console.log("register", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
        />
        {errors.name?.message && (
          <p>{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
        />
        {errors.email?.message && (
          <p>{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
        />
        {errors.password?.message && (
          <p>{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmarContraseña">
          Confirmar contraseña
        </label>
        <input
          id="confirmarContraseña"
          type="password"
          {...register("confirmarContraseña")}
        />
        {errors.confirmarContraseña?.message && (
          <p>{errors.confirmarContraseña.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
      >
        Registrarme
      </button>
    </form>
  );
}
