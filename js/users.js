//if token expired entering this page will redirect to home
//if token expired while in page, (interval maybe), will force redirect to home

document.addEventListener("DOMContentLoaded", checkToken);
window.addEventListener("load", fetchUserInfo);
window.setInterval(checkToken, 60000); //check cookie every 1 min

const userInfoSection = document.querySelector("#userpage-userinfo");

function checkToken() {
    const username = document.cookie.match(/(?<=username\=)[^;]+(?=\;)?/);
    const token = document.cookie.match(/(?<=token\=)[^;]+(?=\;)?/);
    if (!token) document.location.replace("/");
    if (username) {
        document.title = `${username[0]}'s Page | Book Library`;
    }
}

async function fetchUserInfo() {
    const [id] = document.cookie.match(/(?<=id\=)[^;]+(?=\;)?/);
    const token = document.cookie.match(/(?<=token\=)[^;]+(?=\;)?/);

    try {
        const getUser = await fetch(`https://dummyjson.com/auth/users/${id}?select=id,username,firstName,lastName,email,phone,address,image`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (getUser.status === 200) {
            const userData = await getUser.json();
            console.log(userData);
            const userInfoElm = document.createElement("user-info");
            userInfoSection.appendChild(userInfoElm);
            userInfoElm.setUser(userData);
        }
        else if (getUser.status !== 200) {
            const responseTxt = await getUser.text();
            console.warn(responseTxt);
            throw new Error("Unable to obtain user information!");
        }
    }
    catch (error) {
        const errorTxt = document.createElement("p");
        errorTxt.textContent = error.toString();
        userInfoSection.replaceChildren(errorTxt);
        console.warn(error);
    }

}


