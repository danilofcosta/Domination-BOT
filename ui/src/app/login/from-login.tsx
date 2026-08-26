import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          Usuário
        </Label>
  
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Digite seu usuário"
          required
        />
      </div>
      <Separator />
      <div className="space-y-2">
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
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Digite sua senha"
          required
        />
      </div>
    </form>
  );
}
