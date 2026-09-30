
// =========================
// Order System
// =========================

const order = [];

const addButtons = document.querySelectorAll(".add-button");

const orderSummary = document.getElementById("order-summary");
const orderTotal = document.getElementById("order-total");

const collectionTime = document.getElementById("collection-time");
const whatsappButton = document.getElementById("whatsapp-button");

const whatsappNumber = "27834716626";

const preparationTimeInMinutes = 60;


// =========================
// Add Item To Order
// =========================

addButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        // Pap has special rules
        if (name === "Pap") {

            if (!canAddPap()) {

                alert(
                    "Pap can only be ordered with a pork trotter. " +
                    "You can have up to 2 paps per pork trotter."
                );

                return;
            }
        }

        const existingItem = order.find(function (item) {
            return item.name === name;
        });

        if (existingItem) {

            existingItem.quantity++;

        } else {

            order.push({
                name: name,
                price: price,
                quantity: 1
            });

        }

        displayOrder();

    });

});


// =========================
// Check If Pap Can Be Added
// =========================

function canAddPap() {

    const papItem = order.find(function (item) {
        return item.name === "Pap";
    });

    const porkTrotterItem = order.find(function (item) {
        return item.name === "Pork Trotter";
    });

    const currentPaps = papItem
        ? papItem.quantity
        : 0;

    const porkTrotters = porkTrotterItem
        ? porkTrotterItem.quantity
        : 0;

    // Pap cannot be bought without pork trotter
    if (porkTrotters === 0) {
        return false;
    }

    // Each pork trotter allows 2 paps
    const maximumPaps = porkTrotters * 2;

    return currentPaps < maximumPaps;

}


// =========================
// Display Order
// =========================

function displayOrder() {

    orderSummary.innerHTML = "";

    let total = 0;

    order.forEach(function (item, index) {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;

        const orderItem =
            document.createElement("div");

        orderItem.className = "order-item";

        orderItem.innerHTML = `
            <div>
                <strong>${item.name}</strong>

                <div class="quantity-controls">

                    <button
                        type="button"
                        class="quantity-button decrease-button"
                    >
                        −
                    </button>

                    <span>${item.quantity}</span>

                    <button
                        type="button"
                        class="quantity-button increase-button"
                    >
                        +
                    </button>

                </div>
            </div>

            <span>
                R${itemTotal.toFixed(2)}
            </span>

            <button
                type="button"
                class="remove-button"
            >
                Remove
            </button>
        `;


        // =========================
        // Decrease Quantity
        // =========================

        const decreaseButton =
            orderItem.querySelector(".decrease-button");

        decreaseButton.addEventListener("click", function () {

            item.quantity--;

            if (item.quantity <= 0) {

                order.splice(index, 1);

            }

            fixPapQuantity();

            displayOrder();

        });


        // =========================
        // Increase Quantity
        // =========================

        const increaseButton =
            orderItem.querySelector(".increase-button");

        increaseButton.addEventListener("click", function () {

            if (item.name === "Pap") {

                if (!canAddPap()) {

                    alert(
                        "You can have up to 2 paps per pork trotter."
                    );

                    return;

                }

            }

            item.quantity++;

            displayOrder();

        });


        // =========================
        // Remove Item
        // =========================

        const removeButton =
            orderItem.querySelector(".remove-button");

        removeButton.addEventListener("click", function () {

            order.splice(index, 1);

            fixPapQuantity();

            displayOrder();

        });

        orderSummary.appendChild(orderItem);

    });


    // =========================
    // Empty Order
    // =========================

    if (order.length === 0) {

        orderSummary.innerHTML = `
            <p>Your order is currently empty.</p>
        `;

    }


    // =========================
    // Total
    // =========================

    orderTotal.textContent =
        "Total: R" + total.toFixed(2);

}


// =========================
// Fix Pap Quantity
// =========================

function fixPapQuantity() {

    const papItem = order.find(function (item) {
        return item.name === "Pap";
    });

    const porkTrotterItem = order.find(function (item) {
        return item.name === "Pork Trotter";
    });

    // Nothing to fix if there is no Pap
    if (!papItem) {
        return;
    }

    const porkTrotters = porkTrotterItem
        ? porkTrotterItem.quantity
        : 0;

    const maximumPaps =
        porkTrotters * 2;

    // No Pork Trotters means no Pap
    if (porkTrotters === 0) {

        const papIndex =
            order.indexOf(papItem);

        order.splice(papIndex, 1);

        return;
    }

    // Reduce Pap if it is above the allowed amount
    if (papItem.quantity > maximumPaps) {

        papItem.quantity = maximumPaps;

    }

}


// =========================
// Check For Plate
// =========================

function hasPlate() {

    return order.some(function (item) {

        return item.name === "Plate";

    });

}


// =========================
// Check Plate Preparation Time
// =========================

function isCollectionTimeValid() {

    // If there is no Plate,
    // there is no 1-hour preparation rule
    if (!hasPlate()) {

        return true;

    }

    const selectedTime =
        collectionTime.value;

    if (selectedTime === "") {

        return false;

    }

    const now = new Date();

    const [hours, minutes] =
        selectedTime.split(":");

    const collectionDate =
        new Date();

    collectionDate.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
    );

    const earliestCollectionTime =
        new Date(
            now.getTime() +
            preparationTimeInMinutes * 60 * 1000
        );

    return collectionDate >= earliestCollectionTime;

}


// =========================
// WhatsApp Order
// =========================

whatsappButton.addEventListener("click", function () {

    // =========================
    // Check Order
    // =========================

    if (order.length === 0) {

        alert(
            "Please add something to your order first."
        );

        return;

    }


    // =========================
    // Check Collection Time
    // =========================

    if (collectionTime.value === "") {

        alert(
            "Please select your collection time."
        );

        collectionTime.focus();

        return;

    }


    // =========================
    // Check Plate Preparation
    // =========================

    if (!isCollectionTimeValid()) {

        alert(
            "Your order contains a Plate. " +
            "The whole order requires at least 1 hour " +
            "preparation time. Please choose a later " +
            "collection time."
        );

        collectionTime.focus();

        return;

    }


    // =========================
    // Calculate Total
    // =========================

    let total = 0;

    let message =
        "Hello Mathembies Kitchen \n\n" +
        "I would like to place an order:\n\n";


    order.forEach(function (item) {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;

        message +=
            item.name +
            " x" +
            item.quantity +
            " - R" +
            itemTotal.toFixed(2) +
            "\n";

    });


    // =========================
    // Collection Time
    // =========================

    message +=
        "\nTotal: R" +
        total.toFixed(2) +
        "\n\nCollection time: " +
        collectionTime.value;


    // =========================
    // Bottle Exchange
    // =========================

    const hasBottleExchangeDrink =
        order.some(function (item) {

            return (
                item.name === "1L Coke" ||
                item.name === "1L Stone"
            );

        });


    if (hasBottleExchangeDrink) {

        message +=
            "\n\nPlease note: 1L drinks require a bottle exchange.";

    }


    // =========================
    // Final Message
    // =========================

    message +=
        "\n\nThank you!";


    // =========================
    // Open WhatsApp
    // =========================

    const whatsappURL =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIC

