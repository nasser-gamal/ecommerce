const form = document.querySelector("#payment-form");
Stripe.setPublishableKey(
  "pk_test_51MShscBxBfRJQLlvvphjuPPJGuZFrLabqz5JlO3pgKUGFpE7aCF9TPjHtHZPrY8v9UWKzhWjU8Xbj9PgK9SmKPbw00NPt6oiUN"
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  document.querySelector("button").setAttribute("disabled", true);
  Stripe.card.createToken(
    {
      number: document.querySelector(".card-number").value,
      cvc: document.querySelector(".card-cvc").value,
      exp_month: document.querySelector(".card-expiry-month").value,
      exp_year: document.querySelector(".card-expiry-year").value,
    },
    stripeResponseHandler
  );
  return false;
});

function stripeResponseHandler(status, response) {
  // Grab the form:

  if (response.error) {
    // Problem!
    // Show the errors on the form
    document.querySelector(".payment-errors").classList.remove("d-none");
    document.querySelector(".payment-errors").innerHTML = response.error.message;
    document.querySelector("button").removeAttribute("disabled");
  } else {
    // Token was created!

    // Get the token ID:
    var token = response.id;
    document.querySelector(".payment-errors").classList.add("d-none");
    // Insert the token into the form so it gets submitted to the server:
    const input = document.createElement("input");
    input.value = token;
    input.type = "hidden";
    input.name = "stripeToken";
    form.append(input);

    // Submit the form:
    form.submit();
  }
}
