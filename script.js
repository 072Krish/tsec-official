/* =========================================================
   TSEC MEMBERSHIP REGISTRATION
   FRONTEND + GOOGLE APPS SCRIPT
   ========================================================= */


/* =========================================================
   GOOGLE APPS SCRIPT WEB APP URL
   =========================================================

   IMPORTANT:
   Yahan apna CURRENT deployed /exec URL paste karo.

   Example:
   https://script.google.com/macros/s/XXXXXXXX/exec

   /exec hona chahiye.
   /dev nahi.
*/

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbx7fIrKBsS6INPpSx6SbliM1MFcBPf09DIq656Ip50kqATDv3ogc4j3I3nfmHenLi4R/exec";


/* =========================================================
   UPI DETAILS
   ========================================================= */

const BASIC_UPI =
    "8894296770@cred";

const PREMIUM_UPI =
    "kanchandhiman2996-3@oksbi";

const PAYEE_NAME =
    "TrendSetterz Excellence Club";


/* =========================================================
   REGISTRATION STATE
   ========================================================= */

let selectedPlan = "";
let selectedAmount = 0;
let selectedUPI = "";
let selectedNote = "";

let registrationData = null;

let verifying = false;


/* =========================================================
   BACKEND CONFIG CHECK
   ========================================================= */

function isConfigured() {

    return (
        GOOGLE_SCRIPT_URL &&
        GOOGLE_SCRIPT_URL.startsWith(
            "https://script.google.com/macros/s/"
        ) &&
        GOOGLE_SCRIPT_URL.endsWith(
            "/exec"
        )
    );

}


/* =========================================================
   MOBILE CHECK
   ========================================================= */

function isMobile() {

    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i
        .test(
            navigator.userAgent
        );

}


/* =========================================================
   SWEETALERT TOAST
   ========================================================= */

function showToast(icon, title, text = "") {
    Swal.fire({
        toast: true,
        position: "top",
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: "#ffffff",
        color: "#111111",
        target: document.body, // Directly body par render karega
        customClass: {
            popup: "swal2-toast"
        },
        didOpen: (toast) => {
            // Forcefully z-index set karne ke liye inline script backup
            toast.parentElement.style.zIndex = "9999999";
        }
    });
}


/* =========================================================
   CREATE UPI LINK
   ========================================================= */

function createUPILink(
    upiId,
    amount,
    note
) {

    return (
        `upi://pay?pa=${encodeURIComponent(upiId)}` +
        `&pn=${encodeURIComponent(PAYEE_NAME)}` +
        `&am=${encodeURIComponent(amount)}` +
        `&cu=INR` +
        `&tn=${encodeURIComponent(note)}`
    );

}


/* =========================================================
   START REGISTRATION
   ========================================================= */

function startRegistration(
    plan,
    amount
) {

    selectedPlan = plan;

    selectedAmount = amount;


    if (
        plan === "Basic Membership"
    ) {

        selectedUPI =
            BASIC_UPI;

        selectedNote =
            "TSEC Basic Membership";

    }

    else {

        selectedUPI =
            PREMIUM_UPI;

        selectedNote =
            "TSEC Premium Membership";

    }


    document
        .getElementById(
            "selectedPlanText"
        )
        .textContent =
        selectedPlan;


    document
        .getElementById(
            "selectedAmountText"
        )
        .textContent =
        `₹${selectedAmount}`;


    document
        .getElementById(
            "formStep"
        )
        .classList
        .remove("hidden");


    document
        .getElementById(
            "paymentStep"
        )
        .classList
        .add("hidden");


    document
        .getElementById(
            "progress1"
        )
        .classList
        .add("active");


    document
        .getElementById(
            "progress2"
        )
        .classList
        .remove("active");


    document
        .getElementById(
            "registrationModal"
        )
        .classList
        .add("active");


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE REGISTRATION
   ========================================================= */

function closeRegistration() {

    if (verifying) {

        return;

    }


    document
        .getElementById(
            "registrationModal"
        )
        .classList
        .remove("active");


    document.body.style.overflow =
        "";

}


/* =========================================================
   VALIDATE FORM
   ========================================================= */

function validateForm() {

    const form =
        document.getElementById(
            "registrationForm"
        );


    if (!form.checkValidity()) {

        form.reportValidity();

        return false;

    }


    const phone =
        document
            .getElementById(
                "phone"
            )
            .value
            .trim();


    if (
        !/^[0-9]{10}$/.test(phone)
    ) {

        showToast(

            "warning",

            "Invalid phone number",

            "Enter exactly 10 digits."

        );

        return false;

    }


    return true;

}


/* =========================================================
   COLLECT FORM DATA
   ========================================================= */

function collectRegistrationData() {

    return {

        fullName:
            document
                .getElementById(
                    "fullName"
                )
                .value
                .trim(),

        rollNumber:
            document
                .getElementById(
                    "rollNumber"
                )
                .value
                .trim(),

        course:
            document
                .getElementById(
                    "course"
                )
                .value
                .trim(),

        specialization:
            document
                .getElementById(
                    "specialization"
                )
                .value
                .trim(),

        year:
            document
                .getElementById(
                    "year"
                )
                .value
                .trim(),

        email:
            document
                .getElementById(
                    "email"
                )
                .value
                .trim(),

        phone:
            document
                .getElementById(
                    "phone"
                )
                .value
                .trim(),

        plan:
            selectedPlan,

        amount:
            selectedAmount

    };

}


/* =========================================================
   REGISTRATION FORM SUBMIT
   ========================================================= */

document
    .getElementById(
        "registrationForm"
    )
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            if (!validateForm()) {

                return;

            }


            registrationData =
                collectRegistrationData();


            openPaymentStep();

        }
    );


/* =========================================================
   OPEN PAYMENT STEP
   ========================================================= */

function openPaymentStep() {

    document
        .getElementById("formStep")
        .classList
        .add("hidden");


    document
        .getElementById("paymentStep")
        .classList
        .remove("hidden");


    document
        .getElementById("progress1")
        .classList
        .add("active");


    document
        .getElementById("progress2")
        .classList
        .add("active");


    document
        .getElementById("paymentPlanText")
        .textContent = selectedPlan;


    document
        .getElementById("paymentAmountText")
        .textContent = `₹${selectedAmount}`;


    const qrContainer = document.getElementById("upiQr");
    qrContainer.innerHTML = "";


    const upiLink = createUPILink(
        selectedUPI,
        selectedAmount,
        selectedNote
    );


    if (typeof QRCode === "undefined") {
        showToast(
            "error",
            "QR library failed",
            "Please refresh the page."
        );
        return;
    }


    new QRCode(
        qrContainer,
        {
            text: upiLink,
            width: 215,
            height: 215,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        }
    );


    // 1. UTR Input reset karein
    const utrInput = document.getElementById("utr");
    utrInput.value = "";

    // 2. Button ko default disabled set karein
    const verifyBtn = document.getElementById("verifyBtn");
    if (verifyBtn) {
        verifyBtn.disabled = true;
    }
}

/* =========================================================
   UTR LIVE INPUT VALIDATION LISTENER
   ========================================================= */

const utrInput = document.getElementById("utr");
const verifyBtn = document.getElementById("verifyBtn");

if (utrInput && verifyBtn) {
    utrInput.addEventListener("input", function () {
        const cleanValue = normalizeUTR(this.value);
        // Minimum 12 characters hote hi button enable hoga, warna disabled rahega
        verifyBtn.disabled = cleanValue.length < 12;
    });
}


/* =========================================================
   OPEN UPI APP
   ========================================================= */

function openCurrentUPI() {

    if (
        !selectedUPI ||
        !selectedAmount
    ) {

        return;

    }


    const upiLink =
        createUPILink(

            selectedUPI,

            selectedAmount,

            selectedNote

        );


    if (isMobile()) {

        window.location.href =
            upiLink;

    }

    else {

        showToast(

            "info",

            "Open this page on mobile",

            "On desktop, scan the QR using your UPI app."

        );

    }

}


/* =========================================================
   BACK TO FORM
   ========================================================= */

function backToForm() {

    if (verifying) {

        return;

    }


    document
        .getElementById(
            "paymentStep"
        )
        .classList
        .add("hidden");


    document
        .getElementById(
            "formStep"
        )
        .classList
        .remove("hidden");


    document
        .getElementById(
            "progress2"
        )
        .classList
        .remove("active");

}


/* =========================================================
   NORMALIZE UTR
   ========================================================= */

function normalizeUTR(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(
            /\s+/g,
            ""
        )
        .toUpperCase();

}


/* =========================================================
   VERIFY UTR
   =========================================================

   Uses JSONP because Google Apps Script Web Apps
   don't provide normal CORS response headers.

*/

function verifyUTRFromServer(
    utr,
    callback
) {

    const callbackName =
        "__tsecVerify_" +
        Date.now() +
        "_" +
        Math.floor(
            Math.random() * 100000
        );


    const script =
        document.createElement(
            "script"
        );


    let finished = false;


    const timeout =
        setTimeout(

            function () {

                if (finished) {

                    return;

                }


                finished = true;


                cleanup();


                callback({

                    ok: false,

                    message:
                        "Server verification timed out."

                });

            },

            15000

        );


    function cleanup() {

        clearTimeout(
            timeout
        );


        try {

            delete window[
                callbackName
            ];

        }

        catch (error) {

            window[
                callbackName
            ] = undefined;

        }


        if (
            script.parentNode
        ) {

            script.parentNode
                .removeChild(
                    script
                );

        }

    }


    window[
        callbackName
    ] =
        function (response) {

            if (finished) {

                return;

            }


            finished = true;


            cleanup();


            callback(
                response
            );

        };


    script.onerror =
        function () {

            if (finished) {

                return;

            }


            finished = true;


            cleanup();


            callback({

                ok: false,

                message:
                    "Could not connect to Apps Script."

            });

        };


    const url =

        `${GOOGLE_SCRIPT_URL}` +

        `?action=checkUTR` +

        `&utr=${encodeURIComponent(utr)}` +

        `&callback=${encodeURIComponent(callbackName)}` +

        `&_=${Date.now()}`;


    script.src =
        url;


    document.body.appendChild(
        script
    );

}


/* =========================================================
   VERIFY AND REGISTER
   ========================================================= */

function verifyAndRegister() {

    if (verifying) {

        return;

    }


    /* =====================================================
       CHECK BACKEND URL
       ===================================================== */

    if (!isConfigured()) {

        showToast(

            "error",

            "Backend URL missing",

            "Please add your deployed Apps Script /exec URL."

        );

        return;

    }


    /* =====================================================
       CHECK REGISTRATION DATA
       ===================================================== */

    if (!registrationData) {

        showToast(

            "error",

            "Registration data missing",

            "Please start registration again."

        );

        return;

    }


    /* =====================================================
       GET UTR
       ===================================================== */

    const utrInput =
        document.getElementById(
            "utr"
        );


    const utr =
        normalizeUTR(
            utrInput.value
        );


    if (
        !/^[A-Z0-9]{6,35}$/.test(
            utr
        )
    ) {

        showToast(

            "warning",

            "Invalid UTR",

            "Enter a valid UTR / transaction reference ID."

        );


        utrInput.focus();

        return;

    }


    verifying = true;


    const button =
        document.getElementById(
            "verifyBtn"
        );


    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        "Checking UTR...";


    /* =====================================================
       FIRST CHECK
       ===================================================== */

    verifyUTRFromServer(

        utr,

        function (response) {

            /* =============================================
               SERVER ERROR
               ============================================= */

            if (
                !response ||
                response.ok !== true
            ) {

                showToast(

                    "error",

                    "Verification failed",

                    response?.message ||
                    "Could not verify UTR."

                );


                resetVerifyButton(
                    button,
                    originalText
                );


                return;

            }


            /* =============================================
               DUPLICATE UTR
               ============================================= */

            if (
                response.exists === true
            ) {

                showToast(

                    "error",

                    "Registration Failed",

                    "This UTR / reference ID has already been used."

                );


                resetVerifyButton(
                    button,
                    originalText
                );


                return;

            }


            /* =============================================
               NEW UTR
               ============================================= */

            button.textContent =
                "Saving registration...";


            submitRegistration(

                utr,

                button,

                originalText

            );

        }

    );

}


/* =========================================================
   SUBMIT REGISTRATION
   =========================================================

   IMPORTANT:

   Google Apps Script Web App normally gives an opaque
   response when called cross-origin using no-cors.

   Therefore we DO NOT blindly show success.

   Instead:

   1. POST registration.
   2. Wait for request completion.
   3. Check the same UTR again using JSONP.
   4. If UTR now exists -> registration successfully saved.
   5. If UTR doesn't exist -> show failure.

*/


function submitRegistration(
    utr,
    button,
    originalText
) {


    const payload = {

        action:
            "register",

        fullName:
            registrationData.fullName,

        rollNumber:
            registrationData.rollNumber,

        course:
            registrationData.course,

        specialization:
            registrationData.specialization,

        year:
            registrationData.year,

        email:
            registrationData.email,

        phone:
            registrationData.phone,

        plan:
            registrationData.plan,

        amount:
            registrationData.amount,

        utr:
            utr

    };


    /* =====================================================
       SEND POST
       ===================================================== */

    fetch(

        GOOGLE_SCRIPT_URL,

        {

            method:
                "POST",

            mode:
                "no-cors",

            headers: {

                "Content-Type":
                    "text/plain;charset=utf-8"

            },

            body:
                JSON.stringify(
                    payload
                )

        }

    )

    .then(

        function () {

            /*
               IMPORTANT:

               no-cors means we cannot read the Apps Script
               response.

               So we wait briefly for Apps Script to finish
               writing to Google Sheets and then verify the
               UTR from the server.
            */

            setTimeout(

                function () {

                    confirmRegistrationSaved(

                        utr,

                        button,

                        originalText

                    );

                },

                1200

            );

        }

    )

    .catch(

        function () {

            /*
               Network-level failure.
            */

            showToast(

                "error",

                "Registration Failed",

                "Could not send your registration. Please try again."

            );


            resetVerifyButton(

                button,

                originalText

            );

        }

    );

}


/* =========================================================
   CONFIRM REGISTRATION SAVED
   ========================================================= */

function confirmRegistrationSaved(
    utr,
    button,
    originalText
) {

    button.textContent =
        "Confirming...";


    verifyUTRFromServer(

        utr,

        function (response) {

            /* =============================================
               SERVER ERROR
               ============================================= */

            if (
                !response ||
                response.ok !== true
            ) {

                /*
                   Retry once after a short delay.
                   Apps Script may still be writing the row.
                */

                setTimeout(

                    function () {

                        verifyUTRFromServer(

                            utr,

                            function (
                                retryResponse
                            ) {

                                handleSaveConfirmation(

                                    retryResponse,

                                    button,

                                    originalText

                                );

                            }

                        );

                    },

                    1800

                );

                return;

            }


            handleSaveConfirmation(

                response,

                button,

                originalText

            );

        }

    );

}


/* =========================================================
   HANDLE SAVE CONFIRMATION
   ========================================================= */

function handleSaveConfirmation(
    response,
    button,
    originalText
) {

    /* =====================================================
       DATA FOUND IN GOOGLE SHEET
       ===================================================== */

    if (
        response &&
        response.ok === true &&
        response.exists === true
    ) {

        showToast(

            "success",

            "Registration Successful 🎉",

            "Your membership registration has been recorded."

        );


        setTimeout(

            function () {

                resetRegistration();

            },

            1500

        );


        return;

    }


    /* =====================================================
       DATA NOT FOUND
       ===================================================== */

    showToast(

        "error",

        "Registration Failed",

        "Your registration could not be confirmed. Please try again."

    );


    resetVerifyButton(

        button,

        originalText

    );

}


/* =========================================================
   RESET VERIFY BUTTON
   ========================================================= */

function resetVerifyButton(
    button,
    originalText
) {

    button.disabled =
        false;


    button.textContent =
        originalText;


    verifying =
        false;

}


/* =========================================================
   RESET REGISTRATION
   ========================================================= */

function resetRegistration() {

    document
        .getElementById(
            "registrationForm"
        )
        .reset();


    document
        .getElementById(
            "utr"
        )
        .value = "";


    registrationData =
        null;


    selectedPlan =
        "";


    selectedAmount =
        0;


    selectedUPI =
        "";


    selectedNote =
        "";


    document
        .getElementById(
            "formStep"
        )
        .classList
        .remove("hidden");


    document
        .getElementById(
            "paymentStep"
        )
        .classList
        .add("hidden");


    document
        .getElementById(
            "progress1"
        )
        .classList
        .add("active");


    document
        .getElementById(
            "progress2"
        )
        .classList
        .remove("active");


    document
        .getElementById(
            "registrationModal"
        )
        .classList
        .remove("active");


    document.body.style.overflow =
        "";


    const button =
        document.getElementById(
            "verifyBtn"
        );


    // Change: False ki jagah TRUE kar diya gaya hai
    button.disabled =
        true;


    button.textContent =
        "Verify UTR & Register";


    verifying =
        false;

}


/* =========================================================
   MODAL BACKGROUND CLICK
   ========================================================= */

document
    .getElementById(
        "registrationModal"
    )
    .addEventListener(

        "click",

        function (event) {

            if (
                event.target === this &&
                !verifying
            ) {

                closeRegistration();

            }

        }

    );


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(

    "keydown",

    function (event) {

        if (
            event.key === "Escape" &&
            !verifying
        ) {

            closeRegistration();

        }

    }

);

/* Menu Toggle */

const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

if (menuBtn && navbar) {
    const icon = menuBtn.querySelector("i");

    menuBtn.addEventListener("click", function () {
        navbar.classList.toggle("active");
        
        if (navbar.classList.contains("active")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");
        } else {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        }
    });

    const navLinks = navbar.querySelectorAll("a");
    navLinks.forEach(link => {
        link.addEventListener("click", function () {
            navbar.classList.remove("active");
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        });
    });
}

/* =========================================================
   UTR REAL-TIME VALIDATION LISTENER
   ========================================================= */

const utrInputField = document.getElementById("utr");
const verifySubmitBtn = document.getElementById("verifyBtn");

if (utrInputField && verifySubmitBtn) {
    utrInputField.addEventListener("input", function () {
        const cleanUTR = normalizeUTR(this.value);
        // Minimum 12 alphanumeric characters check
        verifySubmitBtn.disabled = cleanUTR.length < 12;
    });
}

