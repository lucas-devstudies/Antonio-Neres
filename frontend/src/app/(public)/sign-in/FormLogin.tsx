'use client';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/app/utils/zodSchemas";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FormLogin(){
    
    const [showPassword,setShowPassword] = useState(false);
    
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema), 
        defaultValues: {
            email: "", 
            password: ""
        }}
    );

    function onSubmit(values: z.infer<typeof loginSchema>){
        console.log(values)
    }
    
    return (
        <form className="flex flex-col gap-4 w-full" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                control={form.control}
                name="email"
                render={({field,fieldState})=>(
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="email">
                            Email
                        </FieldLabel>
                        <Input
                            {...field}
                            id="email"
                            className="w-full"
                            aria-invalid={fieldState.invalid}
                            placeholder="Digite seu email"
                        />
                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]}/>
                        )}
                    </Field>
                )}> 
                </Controller>
                <Controller
                    control={form.control}
                    name="password"
                    render={({field,fieldState})=>(
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="password" className="text-sm font-medium">
                            Senha
                            </label>
                            <div className="relative w-full">
                            <Input
                                {...field}
                                id="password"
                                type={showPassword ? "text" : "password"}
                                aria-invalid={fieldState.invalid}
                                placeholder="Digite sua senha"
                                className="w-full pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            </div>
                            {fieldState.invalid && (
                            <span className="text-sm text-red-500">
                                {fieldState.error?.message}
                            </span>
                            )}
                        </div> 
                    )}
                />
            <Field orientation="horizontal">
                <Button type="submit" className="w-full bg-secondary">
                    Entrar
                </Button>
            </Field>
            <div className="flex items-center text-sm gap-2 justify-end">
                <span className="text-muted-foreground">esqueceu a senha?</span>
                <Link href="/recuperar-senha" className="font-medium text-primary hover:underline">
                    Recuperar a senha
                </Link>
            </div>
            </FieldGroup>
        </form>
    )
}