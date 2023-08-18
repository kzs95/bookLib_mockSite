//this one uses dummyjson.com
const loginForm = document.querySelector("form[name='login-form']");
const registerForm = document.querySelector("form[name='registration-form']");
const passwordShow = document.querySelector(".show-password");
const passwordInput = document.querySelector("[id$='-password']");
const getCredentials = document.querySelector(".login-guide>button");

document.addEventListener("DOMContentLoaded", (event) => {
    const token = document.cookie.match(/(?<=token\=)[^;]+(?=\;)?/);
    const form = document.querySelector("form");
    if (token) {
        if (form) form.remove();
        document.location.replace("/");
    }
});

passwordShow.addEventListener("change", (event) => {
    if (event.target.checked) passwordInput.type = 'text';
    else if (!event.target.checked) passwordInput.type = 'password';
})

if (getCredentials) getCredentials.addEventListener("click", async (event) => {
    try {
        const getUsers = await fetch("https://dummyjson.com/users?limit=0&select=username,password");
        if (getUsers.status === 200) {
            const data = await getUsers.json();
            const userList = data.users;
            const random = Math.floor(Math.random() * 100);
            const usernameInput = event.target.closest("form").querySelector("input[name='username']");
            const pwInput = event.target.closest("form").querySelector("input[name='password']");
            usernameInput.value = userList[random]['username'];
            pwInput.value = userList[random]['password'];
        }
        else {
            throw new Error("Problem fetching data!");
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
    const duration = 7200; //2hrs
    const formData = new FormData(event.target);
    formData.append("expiresInMins", duration / 60);
    const sendData = [...formData.entries()].reduce((obj, [name, value]) => {
        obj[name] = value;
        return { ...obj };
    }, {});
    console.log(sendData)
    try {
        const loginStatus = await fetch("https://dummyjson.com/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(sendData),
            mode: "cors"
        });
        if (loginStatus.status === 200) {
            const response = await loginStatus.json();

            console.log(response);
            document.cookie = `id=${response.id};path=/;max-age=${duration}`;
            document.cookie = `username=${response.username};path=/;max-age=${duration}`;
            document.cookie = `token=${response.token};path=/;max-age=${duration}`;
            document.location.replace("/");
        }
        else if (loginStatus.status === 400) {
            const responseTxt = await loginStatus.text();
            console.warn(responseTxt);
            throw new Error("Incorrect username or password.");
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
        const registerStatus = await fetch("https://dummyjson.com/users/add", {
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
            successTxt.textContent = `Welcome, ${response.username} (User ID: ${response.id}). You will be redirected to the login page shortly.`;
            formElm.replaceWith(successTxt)
            setTimeout(() => {
                document.location.replace("/login.html");
            }, 2000)
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