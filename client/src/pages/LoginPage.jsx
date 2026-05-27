import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Field, FieldLabel, FieldError } from "../components/ui/field";
import { Eye, EyeOff, Lock, User, AlertCircle, UtensilsCrossed } from "lucide-react";

// Schema validation using Zod
const loginSchema = z.object({
    username: z.string().min(1, { message: "El usuario es requerido." }),
    password: z.string().min(1, { message: "La contraseña es requerida." }),
});

export default function LoginPage() {
    const { login, isAuthenticated, error: authError } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState(null);

    // Redirect to home if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/productos", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setLoginError(null);
        try {
            await login(data.username, data.password);
            navigate("/productos", { replace: true });
        } catch (err) {
            setLoginError(err.message || "Usuario o contraseña incorrectos.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-gradient-to-br from-[#FDFBF7] via-[#FFF9F2] to-[#FFEAD2]">
            {/* Background elements for premium aesthetic */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#EE791C]/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#EE791C]/5 blur-3xl pointer-events-none" />

            <div className="w-full max-w-md transition-all duration-300 transform scale-100 hover:scale-[1.01]">
                <div className="backdrop-blur-md bg-white/80 border border-white/50 shadow-[0_15px_35px_rgba(238,121,28,0.08)] rounded-2xl p-8 md:p-10">
                    
                    {/* Branding Header */}
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[#EE791C]/10 text-[#EE791C] ring-4 ring-[#EE791C]/5 animate-bounce-slow">
                            <UtensilsCrossed className="size-8" />
                        </div>
                        <h1 className="font-logo text-4xl md:text-5xl text-[#374151] mb-2 drop-shadow-sm select-none">
                            Taquería Delgado
                        </h1>
                        <p className="text-sm font-semibold tracking-wide text-[#6B7280] uppercase">
                            Sistema de Gestión de Ventas
                        </p>
                    </div>

                    {/* Error Alerts */}
                    {(loginError || authError) && (
                        <div className="flex items-start gap-3 p-4 mb-6 text-sm text-red-800 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30">
                            <AlertCircle className="size-5 shrink-0 text-[#FB4646] mt-0.5" />
                            <div>
                                <span className="font-semibold">Error al iniciar sesión</span>
                                <p className="mt-0.5 text-xs text-red-700/90 dark:text-red-400/80">
                                    {loginError || authError}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Field invalid={!!errors.username}>
                            <FieldLabel className="text-[#374151] font-medium text-sm flex items-center gap-1.5 mb-1.5">
                                <User className="size-4 text-slate-400" />
                                Usuario
                            </FieldLabel>
                            <div className="relative">
                                <Input
                                    {...register("username")}
                                    type="text"
                                    placeholder="Ingresa tu usuario"
                                    className="pr-10 text-base md:text-sm border-[#E5E7EB] bg-[#F9FAFB] focus-visible:border-[#EE791C] focus-visible:ring-[#EE791C]/30 h-11"
                                />
                            </div>
                            <FieldError errors={errors.username ? [errors.username] : []} />
                        </Field>

                        <Field invalid={!!errors.password}>
                            <FieldLabel className="text-[#374151] font-medium text-sm flex items-center gap-1.5 mb-1.5">
                                <Lock className="size-4 text-slate-400" />
                                Contraseña
                            </FieldLabel>
                            <div className="relative">
                                <Input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingresa tu contraseña"
                                    className="pr-10 text-base md:text-sm border-[#E5E7EB] bg-[#F9FAFB] focus-visible:border-[#EE791C] focus-visible:ring-[#EE791C]/30 h-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-[#EE791C] focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-5" />
                                    ) : (
                                        <Eye className="size-5" />
                                    )}
                                </button>
                            </div>
                            <FieldError errors={errors.password ? [errors.password] : []} />
                        </Field>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full text-base font-bold text-white transition-all bg-[#EE791C] hover:bg-[#EE791C]/90 focus-visible:ring-[#EE791C]/50 h-12 shadow-lg shadow-[#EE791C]/20 hover:shadow-xl hover:shadow-[#EE791C]/30 rounded-xl"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Iniciando sesión...</span>
                                </div>
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
