const Koa = require('koa');
const Router = require('koa-router');
const next = require('next');
const fs = require('fs');
const mkdirp = require('mkdirp');
const gm = require('gm').subClass({ imageMagick: true });

import config from './configs/config';
const port = config.port;

const dev = true;
const app = next({ dev });

app.prepare()
	.then(() => {
		const server = new Koa();
		const router = new Router();

		router.get('*', async (ctx) => {
			console.log('Request Route: ', ctx.request.url);

			const requestUrl: string = ctx.request.url;

			// 若路徑格式不對，則 return
			const routePathReg: RegExp = /.*(jpg|jpeg|png)$/;
			if (!routePathReg.test(requestUrl)) {
				console.error('File Path Format is Not Correct!');
				return;
			}

			// 取得 "檔案路徑"、"欲裁切尺寸"、"檔案名稱"
			const filePathReg: RegExp = /(.*\/)(.*)(\/)(.*)/;
			const originFilePath: string = requestUrl.replace(filePathReg, '$1');
			const requiredSize: string = requestUrl.replace(filePathReg, '$2');
			const originFileName: string = requestUrl.replace(filePathReg, '$4');
			console.log(`${originFilePath} ${requiredSize} ${originFileName}`);

			// 若尺寸參數格式不對，則 return
			// 正確格式: 100x100
			const sizeReg: RegExp = /^[1-9]{1}[0-9]{0,}x([1-9]{1}[0-9]{0,})$/;
			if (!sizeReg.test(requiredSize)) {
				console.error('Size Format is Not Correct!');
				return;
			}

			try {
				const width: string = requiredSize.split('x')[0];
				const height: string = requiredSize.split('x')[1];
				const extention: string = originFileName.split('.')[1];
				const extentionStr: string = extention === ('jpg' || 'jpeg') ? 'jpeg' : `${extention}`;

				// 若檔案(裁切尺寸)已經存在，直接從"裁切尺寸"資料夾讀取並回傳
				if (fs.existsSync(`./${requiredSize}/${originFileName}`)) {
					ctx.status = 200;
					ctx.type = `image/${extentionStr}`;
					const src = fs.createReadStream(`./${requiredSize}/${originFileName}`);
					ctx.response.set('Content-Type', `image/${extentionStr}`);
					ctx.set('Cache-Control', 'max-age=30758400');
					ctx.body = src;
					return;
				}

				// 若檔案(原始尺寸)已經存在，直接從"原始尺寸"資料夾 origin 讀取檔案並裁切後回傳
				if (fs.existsSync(`.${originFilePath}${originFileName}`)) {
					await new Promise<void>((resolve, reject) => {
						// 儲存"裁切檔案"
						if (!fs.existsSync(`./${requiredSize}`)) {
							mkdirp(`./${requiredSize}`, (err: any) => {
								if (err) reject(err);
							});
						}
						gm(`.${originFilePath}${originFileName}`)
							.resize(width, height, '^')
							.gravity('Center')
							.extent(width, height)
							.background('none')
							.write(`./${requiredSize}/${originFileName}`, (err: any) => {
								if (err) reject(err);
								resolve();
							});
					});
					ctx.status = 200;
					ctx.type = `image/${extentionStr}`;
					const src = fs.createReadStream(`./${requiredSize}/${originFileName}`);
					ctx.response.set('Content-Type', `image/${extentionStr}`);
					ctx.set('Cache-Control', 'max-age=30758400');
					ctx.body = src;
					return;
				}
			} catch (err) {
				console.error(err);
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
