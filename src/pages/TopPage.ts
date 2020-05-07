/// <reference path="./IPage.ts" />
import Ractive from "ractive";

import "../scss/top.scss";
import Button from "../views/Button";

const sizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];

export default class TopPage implements IPage {
    private app: IApplication;
    private ractive!: Ractive;

    constructor(app: IApplication) {
        this.app = app;
    }
    async onCreate() {
        const t = await this.app.fetchTemplate("top.html");
        this.ractive = new Ractive({
            el: "#container",
            template: t,
            components: {
                Button: Button,
            },
            data: {
                generated: false,
                sizes: sizes,
            },
            on: {
                submit: () => this.submit(),
            },
        });
    }
    async submit() {
        const files = this.ractive.get("files");

        const reader = new FileReader();
        reader.onload = (f) => {
            console.log(f.target?.result);
            const img = document.createElement("img");
            img.src = f.target?.result as string;
            img.onload = async () => {
                await this.ractive.set("generated", true);
                sizes.forEach((s) => {
                    const canvas = document.querySelector(
                        `#canvas${s}`
                    ) as HTMLCanvasElement;
                    canvas.width = s;
                    canvas.height = s;
                    const context = canvas.getContext("2d");
                    context?.drawImage(img, 0, 0, s, s);

                    const url = canvas.toDataURL(); // png
                    const a = document.querySelector(
                        `#download${s}`
                    ) as HTMLAnchorElement;
                    a.href = url;
                    a.download = `${s}x${s}.png`;
                });
            };
        };
        this.ractive.set("generated", false);
        reader.readAsDataURL(files[0]);
    }
}
