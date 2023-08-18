const loginForm = document.querySelector("form[name='login-form']");
const registerForm = document.querySelector("form[name='registration-form']");
const passwordShow = document.querySelector(".show-password");
const passwordInput = document.querySelector("[id$='-password']");
const showEmail = document.querySelector(".login-guide>button");
//redirect to index page if have token in cookie
document.addEventListener("DOMContentLoaded", (event) => {
    const token = document.cookie.match(/(?<=token\=)[^;]+(?=\;)?/);
    const form = document.querySelector("form");
    if (token) {
        if (form) form.remove();
        document.location.replace("/");
    }
});

//show password
passwordShow.addEventListener("change", (event) => {
    if (event.target.checked) passwordInput.type = 'text';
    else if (!event.target.checked) passwordInput.type = 'password';
})

showEmail.addEventListener("click", async (event) => {
    try {
        const userList = await fetch("https://reqres.in/api/users?page=1&per_page=12");
        if (userList.status === 200) {
            const userData = await userList.json();
            const emails = userData.data.map(({ email }) => email);
            const random = Math.floor(Math.random() * 12);
            const emailInput = event.target.closest("form").querySelector("input[type='email']");
            emailInput.value = emails[random];
        }
        else {
            throw new Error("Problem fetching email data!")
        }
    }
    catch (error) {
        if (!document.querySelector(".login-reg-error")) {
            const errorTxt = document.createElement("span");
            errorTxt.className = "login-reg-error";
            errorTxt.textContent = error.toString();
            event.target.closest("form").append(errorTxt);
            setTimeout(() => errorTxt.remove(), 1000);
        }
        console.warn(error);
    }
});



if (loginForm) loginForm.addEventListener("submit", login);
else if (registerForm) registerForm.addEventListener("submit", dummyRegister);

async function login(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const sendData = [...formData.entries()].reduce((obj, [name, value]) => {
        obj[name] = value;
        return { ...obj };
    }, {});
    try {
        const loginStatus = await fetch("https://reqres.in/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(sendData),
            mode: 'cors'
        });
        if (loginStatus.status === 200) {
            const response = await loginStatus.json();
            const duration = 86400;
            document.cookie = `username=TestUser;path=/;max-age=${duration}`; //test
            document.cookie = `token=${response.token};path=/;max-age=${duration}`;
            document.cookie = `logintime=${new Date(Date.now()).toUTCString()};path=/;max-age=${duration}`; //test
            document.location.replace("/");
        }
        else if (loginStatus.status === 400) {
            const responseTxt = await loginStatus.text();
            console.warn(responseTxt);
            throw new Error("Incorrect email or password.");
        }
    }
    catch (error) {
        if (!document.querySelector(".login-reg-error")) {
            const errorTxt = document.createElement("span");
            errorTxt.className = "login-reg-error";
            errorTxt.textContent = error.toString();
            event.target.append(errorTxt);
            setTimeout(() => errorTxt.remove(), 1000);
        }
        console.warn(error);
    }
}

async function dummyRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const sendData = [...formData.entries()].reduce((obj, [name, value]) => {
        obj[name] = value;
        return { ...obj };
    }, {});
    try {
        const registerStatus = await fetch("https://reqres.in/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(sendData),
            mode: 'cors'
        });
        if (registerStatus.status === 200) {
            const response = await registerStatus.json();
            const successTxt = document.createElement("p");
            const formElm = event.target;
            successTxt.textContent = `Welcome, User No.${response.id}. You will be redirected to the login page shortly.`;
            formElm.replaceWith(successTxt)
            setTimeout(() => {
                document.location.replace("/login.html");
            }, 2500)
        }
        else if (registerStatus.status !== 200) {
            const responseTxt = await registerStatus.text();
            console.warn(responseTxt);
            throw new Error("Invalid details.");
        }
    }
    catch (error) {
        if (!document.querySelector(".login-reg-error")) {
            const errorTxt = document.createElement("span");
            errorTxt.className = "login-reg-error";
            errorTxt.textContent = error.toString();
            event.target.append(errorTxt);
            setTimeout(() => errorTxt.remove(), 1000);
        }
        console.warn(error);
    }
}

//logout placed in book_component.js