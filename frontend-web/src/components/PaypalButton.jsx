import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function PaypalButton({ amount, onSuccess }) {
  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "AeA60OeztFdPP8qU8THyq9xAiViEicyaZDdPW3TvAkQTKt7CMGoTFRX-2iCbUcjIjyPgAsF_l6r53fUV", // <-- CLIENT_ID
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: amount } }],
          });
        }}
        onApprove={async (data, actions) => {
          const details = await actions.order.capture();
          onSuccess(details);
        }}
      />
    </PayPalScriptProvider>
  );
}
