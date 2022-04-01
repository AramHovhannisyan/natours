import axios from "axios"

const stripe = Stripe('pi_3KizlBGFG4LxFJeZ0JnteevY')

export const bookTour = async (tourId) => {
    try {
        // Get Checkout Session from API
        const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`)
        console.log(session.data.session.id)

        // create checkout form + charge credit card
        console.log('aaaaaaaaaa');
        const result = await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
            a: 1
        });
        console.log('bbbbbbbbbbbb');

        if (result.error) {
            alert(result.error.message);
        }else{
            alert('No Error')
        }


    } catch (error) {
        console.log(error);
    }

}

console.log(stripe);