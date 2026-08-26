import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function LoginForm({
  onSubmit,
  showPassword,
  setShowPassword,
  pending,
  message,
  forgotPasswordUrl,
}: any) {
  return (
    <form className="space-y-4 p-2" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-sm font-medium">
          Usuário
        </Label>
        <div className="relative">
          <User
            data-icon="inline-start"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Digite seu usuário"
            className="pl-8"
            required
          />
        </div>
      </div>
      <Separator />
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Senha
          </Label>
          <a
            href={forgotPasswordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Esqueceu a senha?
          </a>
        </div>
        <div className="relative">
          <LockKeyhole
            data-icon="inline-start"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            className="pr-8 pl-8"
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value: boolean) => !value)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <LogIn data-icon="inline-start" />
        )}
        {pending ? "Entrando..." : "Entrar"}
      </Button>
      {message && (
        <p
          role="status"
          className={cn(
            "text-center text-sm",
            message.error
              ? "text-destructive"
              : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
