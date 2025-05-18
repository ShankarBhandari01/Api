// handlebarsHelpers.js
export function registerHelpers(handlebarsInstance) {
  handlebarsInstance.registerHelper(
    "formatCurrency",
    function (amount, locale = "fi-FI", currency = "EUR") {
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
        }).format(amount);
      } catch (err) {
        return amount;
      }
    }
  );
}
