const Koa = require('koa');
const Router = require('koa-router');
const next = require('next');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });

import config from './configs/config';
const port = config.port;

const dev = true;
const app = next({ dev });

const originExampleFile = config.originExampleFile;

app.prepare()
	.then(() => {
		const server = new Koa();
		const router = new Router();

		router.get('/:size/:originFileGUID', async (ctx) => {
			const { originFileGUID, size } = ctx.params;

			// 若尺寸參數格式不對，則 return
			// 正確格式: 100x100
			const sizeReg: RegExp = /^[1-9]{1}[0-9]{0,}x([1-9]{1}[0-9]{0,})(@[0-9])?$/;
			if (!sizeReg.test(size)) return;

			try {
				const width: string = size.split('x')[0];
				const height: string = size.split('x')[1];
				const extention: string = originFileGUID.split('.')[1];

				// 若檔案(裁切尺寸)已經存在，直接從"裁切尺寸"資料夾讀取並回傳
				if (fs.existsSync(`./${size}/${originFileGUID}`)) {
					ctx.status = 200;
					ctx.type = 'image/*';
					const src = fs.createReadStream(`./${size}/${originFileGUID}`);
					ctx.response.set(
						'Content-Type',
						`image/${extention === 'jpg' || 'jpeg' ? 'jpeg' : `${extention}`}`,
					);
					ctx.set('Cache-Control', 'max-age=30758400');
					ctx.body = src;
					return;
				}

				// 若檔案(原始尺寸)已經存在，直接從"原始尺寸"資料夾 origin 讀取檔案並裁切後回傳
				if (fs.existsSync(`${originExampleFile}`)) {
					await new Promise((resolve, reject) => {
						// 儲存"裁切檔案"
						if (!fs.existsSync(`./${size}`)) {
							fs.mkdir(`./${size}`, { recursive: true }, (err: any) => {
								if (err) reject(err);
							});
						}
						gm(`./origin/${originFileGUID}`)
							.crop(width, height)
							.write(`./${size}/${originFileGUID}`, (err: any) => {
								if (err) reject(err);
								resolve();
							});
					});
					ctx.status = 200;
					ctx.type = 'image/*';
					const src = fs.createReadStream(`./${size}/${originFileGUID}`);
					ctx.response.set(
						'Content-Type',
						`image/${extention === 'jpg' || 'jpeg' ? 'jpeg' : `${extention}`}`,
					);
					ctx.set('Cache-Control', 'max-age=30758400');
					ctx.body = src;
					return;
				}
			} catch (err) {
				ctx.status = 404;
				return;
			}
		});

		server.use(router.routes());
		server.listen(port, (err: any) => {
			if (err) {
				throw err;
			}
			console.log(`> WEB Ready on http://localhost:${port}`);
		});
	})
	.catch((ex: any) => {
		console.error(ex.stack);
		process.exit(1);
	});
