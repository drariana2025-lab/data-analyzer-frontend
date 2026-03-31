/**
 * Русские шаблоны email-писем для Supabase Auth.
 *
 * Как использовать:
 * 1. Зайдите на supabase.com/dashboard
 * 2. Откройте проект → Authentication → Email Templates
 * 3. Скопируйте нужный шаблон (subject + html) из этого файла
 * 4. Вставьте в соответствующий шаблон в Supabase
 *
 * Переменные Supabase, которые подставляются автоматически:
 * {{ .ConfirmationURL }} — ссылка для подтверждения
 * {{ .Token }}          — одноразовый код (OTP)
 * {{ .Email }}          — email пользователя
 * {{ .SiteURL }}        — адрес вашего сайта
 */

// ─────────────────────────────────────────────────────────────
// 1. Подтверждение регистрации (Confirm signup)
// ─────────────────────────────────────────────────────────────
export const CONFIRM_SIGNUP = {
  subject: 'Подтверждение email — Мониторинг заболеваний',

  html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Подтверждение email</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;
                 box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Шапка -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8,#0d47a1);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                          letter-spacing:0.5px;">
                🛡️ Мониторинг заболеваний
              </h1>
            </td>
          </tr>

          <!-- Тело -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">
                Подтверждение email
              </h2>
              <p style="margin:0 0 12px;color:#4a5568;font-size:15px;line-height:1.6;">
                Спасибо за регистрацию! Чтобы активировать аккаунт, подтвердите
                ваш email-адрес, нажав на кнопку ниже.
              </p>
              <p style="margin:0 0 28px;color:#4a5568;font-size:15px;line-height:1.6;">
                Если вы не регистрировались на нашем сайте — просто проигнорируйте
                это письмо.
              </p>

              <!-- Кнопка -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="{{ .ConfirmationURL }}"
                   style="display:inline-block;background:#1a73e8;color:#ffffff;
                          text-decoration:none;padding:14px 36px;border-radius:8px;
                          font-size:15px;font-weight:600;letter-spacing:0.3px;">
                  Подтвердить email
                </a>
              </div>

              <!-- Альтернативная ссылка -->
              <p style="margin:0 0 8px;color:#718096;font-size:13px;">
                Если кнопка не работает, скопируйте ссылку:
              </p>
              <p style="margin:0;color:#1a73e8;font-size:13px;word-break:break-all;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>

          <!-- Подвал -->
          <tr>
            <td style="background:#f7fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
                Это автоматическое письмо. Пожалуйста, не отвечайте на него.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
};

// ─────────────────────────────────────────────────────────────
// 2. Magic Link — вход по одноразовой ссылке
//    Supabase Magic Link slot → использует {{ .ConfirmationURL }}
// ─────────────────────────────────────────────────────────────
export const MAGIC_LINK = {
  subject: 'Ссылка для входа в аккаунт — Мониторинг заболеваний',

  html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Вход в аккаунт</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;
                 box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Шапка -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8,#0d47a1);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                🛡️ Мониторинг заболеваний
              </h1>
            </td>
          </tr>

          <!-- Тело -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">
                Здравствуйте!
              </h2>
              <p style="margin:0 0 12px;color:#4a5568;font-size:15px;line-height:1.6;">
                Вы запросили вход в аккаунт <strong>{{ .Email }}</strong>.
              </p>
              <p style="margin:0 0 28px;color:#4a5568;font-size:15px;line-height:1.6;">
                Нажмите на кнопку ниже, чтобы войти. Ссылка одноразовая и действительна
                <strong>1 час</strong>.
              </p>

              <!-- Кнопка входа -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="{{ .ConfirmationURL }}"
                   style="display:inline-block;background:#1a73e8;color:#ffffff;
                          text-decoration:none;padding:14px 36px;border-radius:8px;
                          font-size:15px;font-weight:600;letter-spacing:0.3px;">
                  Войти в аккаунт
                </a>
              </div>

              <!-- Предупреждение -->
              <div style="background:#fff5f5;border-left:4px solid #e53e3e;
                          border-radius:4px;padding:14px 16px;margin-bottom:20px;">
                <p style="margin:0;color:#742a2a;font-size:14px;line-height:1.5;">
                  🔒 Если вы не запрашивали вход — просто проигнорируйте это письмо.
                  Ваш аккаунт в безопасности.
                </p>
              </div>

              <!-- Альтернативная ссылка -->
              <p style="margin:0 0 8px;color:#718096;font-size:13px;">
                Если кнопка не работает, скопируйте ссылку:
              </p>
              <p style="margin:0;color:#1a73e8;font-size:13px;word-break:break-all;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>

          <!-- Подвал -->
          <tr>
            <td style="background:#f7fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
                Это автоматическое письмо. Пожалуйста, не отвечайте на него.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
};

// ─────────────────────────────────────────────────────────────
// 3. Подтверждение входа с кодом OTP (для OTP / Reauthentication)
//    Использует {{ .Token }} — числовой код, НЕ ссылку
// ─────────────────────────────────────────────────────────────
export const LOGIN_CONFIRMATION = {
  subject: 'Подтверждение входа в аккаунт — Мониторинг заболеваний',

  html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Подтверждение входа</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;
                 box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Шапка -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8,#0d47a1);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                🛡️ Мониторинг заболеваний
              </h1>
            </td>
          </tr>

          <!-- Тело -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">
                Подтверждение входа
              </h2>
              <p style="margin:0 0 12px;color:#4a5568;font-size:15px;line-height:1.6;">
                Зафиксирована попытка входа в ваш аккаунт
                (<strong>{{ .Email }}</strong>).
              </p>
              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
                Если это были вы, используйте код ниже для подтверждения входа:
              </p>

              <!-- Код подтверждения -->
              <div style="background:#f0f4ff;border:2px dashed #1a73e8;
                          border-radius:10px;padding:20px;text-align:center;
                          margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#4a5568;font-size:13px;
                            text-transform:uppercase;letter-spacing:1px;">
                  Ваш код подтверждения
                </p>
                <p style="margin:0;color:#1a1a2e;font-size:36px;font-weight:700;
                            letter-spacing:8px;font-family:monospace;">
                  {{ .Token }}
                </p>
                <p style="margin:8px 0 0;color:#e53e3e;font-size:13px;font-weight:600;">
                  ⏱ Код действителен 10 минут
                </p>
              </div>

              <!-- Предупреждение -->
              <div style="background:#fff5f5;border-left:4px solid #e53e3e;
                          border-radius:4px;padding:14px 16px;margin-bottom:24px;">
                <p style="margin:0;color:#742a2a;font-size:14px;line-height:1.5;">
                  🔒 <strong>Никому не сообщайте этот код</strong>, в том числе
                  сотрудникам поддержки.
                </p>
              </div>

              <p style="margin:0 0 8px;color:#4a5568;font-size:15px;line-height:1.6;">
                Если это были <strong>не вы</strong> — немедленно примите меры
                для защиты аккаунта:
              </p>

              <!-- Кнопки действий -->
              <div style="display:flex;gap:12px;margin-top:20px;">
                <a href="{{ .SiteURL }}/reset-password"
                   style="display:inline-block;background:#e53e3e;color:#ffffff;
                          text-decoration:none;padding:12px 24px;border-radius:8px;
                          font-size:14px;font-weight:600;margin-right:12px;">
                  Сменить пароль
                </a>
                <a href="{{ .SiteURL }}/support"
                   style="display:inline-block;background:#edf2f7;color:#4a5568;
                          text-decoration:none;padding:12px 24px;border-radius:8px;
                          font-size:14px;font-weight:600;">
                  Обратиться в поддержку
                </a>
              </div>
            </td>
          </tr>

          <!-- Подвал -->
          <tr>
            <td style="background:#f7fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
                Это автоматическое письмо. Пожалуйста, не отвечайте на него.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
};

// ─────────────────────────────────────────────────────────────
// 3. Вход с нового устройства
// ─────────────────────────────────────────────────────────────
export const NEW_DEVICE_LOGIN = {
  subject: 'Вход с нового устройства — Мониторинг заболеваний',

  html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Вход с нового устройства</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;
                 box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Шапка -->
          <tr>
            <td style="background:linear-gradient(135deg,#f6ad55,#dd6b20);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                ⚠️ Мониторинг заболеваний
              </h1>
            </td>
          </tr>

          <!-- Тело -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">
                Вход с нового устройства
              </h2>
              <p style="margin:0 0 12px;color:#4a5568;font-size:15px;line-height:1.6;">
                Зафиксирован вход в ваш аккаунт (<strong>{{ .Email }}</strong>)
                с нового устройства или браузера.
              </p>
              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
                Если это были вы — ничего делать не нужно.
              </p>
              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
                Если это были <strong>не вы</strong> — немедленно смените пароль
                и обратитесь в поддержку:
              </p>

              <div style="display:flex;gap:12px;">
                <a href="{{ .SiteURL }}/reset-password"
                   style="display:inline-block;background:#e53e3e;color:#ffffff;
                          text-decoration:none;padding:12px 24px;border-radius:8px;
                          font-size:14px;font-weight:600;margin-right:12px;">
                  Сменить пароль
                </a>
                <a href="{{ .SiteURL }}/support"
                   style="display:inline-block;background:#edf2f7;color:#4a5568;
                          text-decoration:none;padding:12px 24px;border-radius:8px;
                          font-size:14px;font-weight:600;">
                  Обратиться в поддержку
                </a>
              </div>
            </td>
          </tr>

          <!-- Подвал -->
          <tr>
            <td style="background:#f7fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
                Это автоматическое письмо. Пожалуйста, не отвечайте на него.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
};

// ─────────────────────────────────────────────────────────────
// 4. Сброс пароля (Reset Password)
// ─────────────────────────────────────────────────────────────
export const RESET_PASSWORD = {
  subject: 'Сброс пароля — Мониторинг заболеваний',

  html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Сброс пароля</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;
                 box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8,#0d47a1);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                🔑 Мониторинг заболеваний
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">
                Сброс пароля
              </h2>
              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
                Вы (или кто-то другой) запросили сброс пароля для аккаунта
                <strong>{{ .Email }}</strong>. Нажмите кнопку ниже, чтобы
                задать новый пароль.
              </p>
              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
                Если вы не запрашивали смену пароля — просто проигнорируйте
                это письмо. Ваш пароль останется прежним.
              </p>

              <div style="text-align:center;margin-bottom:28px;">
                <a href="{{ .ConfirmationURL }}"
                   style="display:inline-block;background:#1a73e8;color:#ffffff;
                          text-decoration:none;padding:14px 36px;border-radius:8px;
                          font-size:15px;font-weight:600;">
                  Сбросить пароль
                </a>
              </div>

              <div style="background:#fff5f5;border-left:4px solid #e53e3e;
                          border-radius:4px;padding:14px 16px;">
                <p style="margin:0;color:#742a2a;font-size:14px;line-height:1.5;">
                  ⏱ Ссылка действительна <strong>1 час</strong>.
                  Никому не сообщайте её.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f7fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
                Это автоматическое письмо. Пожалуйста, не отвечайте на него.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
};

// ─────────────────────────────────────────────────────────────
// 5. Динамический шаблон подтверждения входа
//    Использование: loginConfirmation('123456', 'Chrome / Windows')
// ─────────────────────────────────────────────────────────────
export const loginConfirmation = (code: string, deviceInfo?: string) => ({
  subject: 'Подтверждение входа в аккаунт',

  html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Подтверждение входа</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;
                 box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Шапка -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8,#0d47a1);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                🛡️ Мониторинг заболеваний
              </h1>
            </td>
          </tr>

          <!-- Тело -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">
                Здравствуйте!
              </h2>
              <p style="margin:0 0 12px;color:#4a5568;font-size:15px;line-height:1.6;">
                Зафиксирована попытка входа в ваш аккаунт.
              </p>

              ${deviceInfo ? `
              <p style="margin:0 0 16px;color:#4a5568;font-size:15px;line-height:1.6;">
                <strong>Устройство:</strong> ${deviceInfo}
              </p>` : ''}

              <p style="margin:0 0 20px;color:#4a5568;font-size:15px;line-height:1.6;">
                Если это были вы, используйте код подтверждения:
              </p>

              <!-- Код подтверждения -->
              <div style="background:#f0f0f0;border-radius:10px;padding:20px;
                          text-align:center;margin-bottom:20px;">
                <p style="margin:0 0 6px;color:#718096;font-size:13px;
                            text-transform:uppercase;letter-spacing:1px;">
                  Ваш код подтверждения
                </p>
                <p style="margin:0;color:#1a1a2e;font-size:36px;font-weight:700;
                            letter-spacing:8px;font-family:monospace;">
                  <strong>${code}</strong>
                </p>
              </div>

              <!-- Срок действия -->
              <p style="margin:0 0 12px;color:#e53e3e;font-size:14px;font-weight:600;">
                ⏱ Код действителен 10 минут.
              </p>

              <!-- Предупреждение -->
              <p style="margin:0 0 20px;color:#1a1a2e;font-size:15px;line-height:1.6;">
                <strong>Никому не сообщайте этот код.</strong>
              </p>

              <!-- Предупреждение о чужом входе -->
              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
                Если это были не вы, рекомендуется
                <a href="{{passwordResetLink}}"
                   style="color:#1a73e8;text-decoration:underline;">
                  сменить пароль
                </a>.
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;" />

              <p style="margin:0;color:#718096;font-size:14px;">
                С уважением, команда «Мониторинг заболеваний»
              </p>
            </td>
          </tr>

          <!-- Подвал -->
          <tr>
            <td style="background:#f7fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
                Это автоматическое письмо. Пожалуйста, не отвечайте на него.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
});
