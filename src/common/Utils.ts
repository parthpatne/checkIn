import * as uuid from "uuid";

export class Utils {
    public static generateGUID(): string {
        return uuid.v4();
    }

    public static isEmptyString(str: string): boolean {
        return this.isEmptyObject(str);
    }

    public static isEmptyObject(obj: any): boolean {
        if (obj == undefined || obj == null) {
            return true;
        }

        var isEmpty = false;

        if (typeof obj === "number" || typeof obj === "boolean") {
            isEmpty = false;
        } else if (typeof obj === "string") {
            isEmpty = obj.trim().length == 0;
        } else if (Array.isArray(obj)) {
            isEmpty = obj.length == 0;
        } else if (typeof obj === "object") {
            if (this.isValidJson(obj)) {
                isEmpty = JSON.stringify(obj) == "{}";
            }
        }
        return isEmpty;
    }

    public static isValidJson(json: any): boolean {
        try {
            JSON.parse(JSON.stringify(json));
            return true;
        } catch (e) {
            return false;
        }
    }
    public static getDateTimeFormat(dateTime) {
        let date = new Date(dateTime);
        let hours = date.getHours();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        let min = this.convertToTwoDigitString(date.getMinutes());
        return date.toDateString() + ", " + Utils.convertToTwoDigitString(hours) + ":" + min + " " + ampm;
    }
    public static getHTMLFormatDateTime(dateTime) {
        let dueBy = new Date(dateTime);
        let month = this.convertToTwoDigitString(dueBy.getMonth() + 1);
        let date = this.convertToTwoDigitString(dueBy.getDate());
        let hour = this.convertToTwoDigitString(dueBy.getHours());
        let min = this.convertToTwoDigitString(dueBy.getMinutes());
        let formattedDateTime = dueBy.getFullYear() + "-" + month + "-" + date + "T" + hour + ":" + min;
        return formattedDateTime;
    }
    public static convertToTwoDigitString(num) {
        let numberString = (num < 10 ? "0" : "") + num;
        return numberString;
    }
}
