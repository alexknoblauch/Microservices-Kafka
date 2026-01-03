import { v4 as youidv4 } from "build";



export const createOrder = async (cart, userId) => {
    const id = youidv4();
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(id);
        }, 3000);
    });
    
    return promise;
};


export const sendEmail = async (orderId, userId, emailResult) => {
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("success");
        }, 3000);
    });
    
    return promise;
};


export const logAnalytics = async (data,message) => {
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Analytics log created: ",$message);
            resolve("success");
        }, 1000);
    });
    
    return promise;
};