import axios from "axios";

const Payment = () => {

  const handlePayment = async () => {
    try {

      // Check Razorpay SDK
      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

      // Get JWT Token
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      // Payment Amount
      const amount = 500;

      // Create Razorpay Order
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/payment/create-order`,
        {
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const order = response.data.order;

      // Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,

        amount: order.amount,

        currency: order.currency,

        name: "MERN Financial Dashboard",

        description: "Stock Purchase",

        order_id: order.id,

        handler: async function (paymentResponse) {
          try {

            // Verify Payment
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/payment/verify-payment`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                amount,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (verifyResponse.data.success) {
              alert("Payment Successful");
              console.log(verifyResponse.data);
            } else {
              alert("Payment Verification Failed");
            }

          } catch (error) {
            console.error(error);
            alert("Verification Failed");
          }
        },

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.log(response.error);
        alert("Payment Failed");
      });

      razorpay.open();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={handlePayment}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Pay ₹500
      </button>
    </div>
  );
};

export default Payment;