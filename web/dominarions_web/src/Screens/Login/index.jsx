import React, { useEffect } from 'react';
import { BodyContainer, StyledButton, Container ,Title} from './styles';

function Login() {

  useEffect(() => {
    // Função global exigida pelo Telegram
    window.onTelegramAuth = (user) => {
      alert(
        `Logged in as ${user.first_name} ${user.last_name} (${user.id}${
          user.username ? ', @' + user.username : ''
        })`
      );
    };

    // Criar script dinamicamente
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'Wadomination_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    document.getElementById('telegram-login').appendChild(script);
  }, []);

  return (
    <BodyContainer>
      <Container>
        <Title>Welcome to Dominarions</Title>

        <StyledButton>Login</StyledButton>
        <StyledButton>Create Account</StyledButton>
        

        {/* Container do botão Telegram */}
        <div id="telegram-login" />
      </Container>
    </BodyContainer>
  );
}

export default Login;
