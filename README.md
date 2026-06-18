# Stripe Connect Demo — Marketplace

Demo funcional de marketplace con pagos divididos usando Stripe Connect Express.

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Variables de entorno

El archivo `.env.local` ya está configurado con las keys de test. Para el webhook:

### Configurar webhook local (opcional)

1. Instala Stripe CLI: <https://stripe.com/docs/stripe-cli>
2. Ejecuta:

   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Copia el `whsec_...` que aparece y reemplázalo en `.env.local`

## Flujo de la demo

### 1. Registrar vendedor

- Ve a `/seller/register`
- Completa el formulario
- Stripe redirige al onboarding Express (en test no necesitas datos reales)
- Vuelves a `/seller/onboarding-complete`

### 2. Comprar un producto

- Ve a `/products`
- Elige un producto y haz clic en "Comprar"
- Usa la tarjeta de prueba: `4242 4242 4242 4242`
- Fecha: cualquier fecha futura | CVC: cualquier 3 dígitos

### 3. Ver el dashboard admin

- Ve a `/admin`
- Verás las cuentas conectadas, transferencias y volumen

## Estructura

```
app/
  page.tsx                          ← Home
  seller/
    register/page.tsx               ← Formulario de registro
    onboarding-complete/page.tsx    ← Confirmación post-Stripe
    dashboard/page.tsx              ← Lista de vendedores
  products/
    page.tsx                        ← Catálogo
    [id]/page.tsx                   ← Checkout individual
  admin/page.tsx                    ← Panel admin
  success/page.tsx                  ← Confirmación de pago
  api/stripe/
    create-account/route.ts         ← Crea cuenta Connect
    create-payment-intent/route.ts  ← Crea pago dividido
    webhook/route.ts                ← Escucha eventos Stripe
components/
  CheckoutForm.tsx                  ← Stripe Elements
lib/
  stripe.ts                         ← Cliente Stripe
```

## División de pagos

- **90%** → cuenta del vendedor (via `transfer_data.destination`)
- **10%** → plataforma (via `application_fee_amount`)
