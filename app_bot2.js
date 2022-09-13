const { Telegraf } = require('telegraf');
const bot = new Telegraf('5434295456:AAHIna38OmszBNQGkJQeC1eBNyDmMkZIix0');
const fs = require("fs");
const Markup = require("telegraf/markup.js");
//const cron = require('node-cron');
const yandex_speech = require('yandex-speech');
var request = require('request');

let fileContent = fs.readFileSync("users.txt", "utf8");
let userBuffer = {};
userBuffer.user = [];
userBuffer.id = [];
userBuffer.total = 0;
if (JSON.parse(fileContent).total!=0)
	userBuffer = JSON.parse(fileContent);
let savingData = [];
let regUserId = [];
let setRequvest = [];
let setRequvestId = [];
let timerRequvestLocalId = [];
let iForSeach = {};
iForSeach.id=[];
iForSeach.count=[];

var regexp = /^[a-z\s]+$/i;
var reg = /^[а-яёa-z]*$/i;

bot.start((ctx) => {
	ctx.reply('Привет. Попробуем начать работу')
	if (userBuffer.total) {
		if (userBuffer.id.indexOf(ctx.from.id)>=0){
			ctx.reply(userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].name + ', что бы ты хотел сделать?');
			if (userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].manager)
				ctx.replyWithHTML('Меню обновлено', getMainManagerMenu());
			else 
				ctx.replyWithHTML('Меню обновлено', getMainDeveloperMenu());			
		}
	}
	else {
      ctx.replyWithHTML(
        'Судя по всему, ты здесь впервые\n'+
        'Зарегистрируешься?',
        yesNoRegKeyboard())
	}
});
bot.help((ctx) => ctx.reply('Я представляю из себя бота-планировщика задач'));

bot.on('voice', async (ctx) => {	
	const fileId = ctx.update.message.voice.file_id;
	let lincV = (await bot.telegram.getFileLink(fileId)).toString();
	ctx.reply(lincV);
	await yandex_speech.ASR({
    developer_key: 'e8587215-776a-4f90-a2b6-090d27a07d24',    
    file: 'voice/file_2.oga',
	}, function(err, httpResponse, xml){
		if(err){
    		console.log(err);
    	}else{
			console.log('\n\n');
    		console.log(httpResponse);
			console.log('\n\n');
    		console.log(httpResponse.statusCode, xml)
    	}
    }
);
});

bot.on('text', async ctx => {
	var buf = ctx.message.text;
	fs.appendFileSync('logs.txt', ('text: ' + ctx.from.id)+'\n');
	console.log('UserId: ' + ctx.from.id);
	fs.appendFileSync('logs.txt', ('text: ' + ctx.from.first_name)+'\n');
	console.log('first_name: ' + ctx.from.first_name);
	fs.appendFileSync('logs.txt', ('text: ' + ctx.from.last_name)+'\n');
	console.log('last_name: ' + ctx.from.last_name);
	fs.appendFileSync('logs.txt', ('text: ' + ctx.from.username)+'\n');
	console.log('username: ' + ctx.from.username);
	console.log('text: ' + ctx.message.text);
	fs.appendFileSync('logs.txt', ('text: ' + ctx.message.text)+'\n\n');
	buf=buf.trim();
	buf=buf.toLowerCase();
	if (regUserId.includes(ctx.from.id)) {
		regUserId.splice(regUserId.indexOf(ctx.from.id),1);
		savingData.push({
			name: buf,
			id: ctx.from.id,
			manager: false,
		}); 
		ctx.replyWithHTML(
			`тебя зовут ${buf} \n`+
			'Сохраняем?',
			yesNoEndRegKeyboard())
	}			
	if ((setRequvestId.includes(ctx.from.id))&&(setRequvest[setRequvestId.indexOf(ctx.from.id)].date)&&(setRequvest[setRequvestId.indexOf(ctx.from.id)].time)&&(!setRequvest[setRequvestId.indexOf(ctx.from.id)].text))
	{
		console.log('text start ' + JSON.stringify(setRequvestId));
		buf=ctx.message.text;
		buf.trim();
		setRequvest[setRequvestId.indexOf(ctx.from.id)].text=buf;
		setRequvest[setRequvestId.indexOf(ctx.from.id)].timerId=timerRequvestLocalId.length;
		ctx.reply('готово');
		if (!userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].hasOwnProperty('remind')) userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind = [];
		let timer = setTimeout(reqFuncSend, (setRequvest[setRequvestId.indexOf(ctx.from.id)].time-Number(new Date)), ctx.from.id, buf, userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind.length);
		console.log(userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind.length);
		timerRequvestLocalId.push(timer);
		userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind.push(setRequvest[setRequvestId.indexOf(ctx.from.id)]);
		fs.writeFile("users.txt", JSON.stringify(userBuffer), function(error) {
			if(error) throw error;
			console.log('write done');
			let data = fs.readFileSync("users.txt", "utf8");
			console.log(data);
		});
		setRequvest.splice(setRequvestId.indexOf(ctx.from.id),1);
		setRequvestId.splice(setRequvestId.indexOf(ctx.from.id),1);
		if (userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].manager)
			ctx.replyWithHTML('Меню обновлено', getMainManagerMenu());
		else 
			ctx.replyWithHTML('Меню обновлено', getMainDeveloperMenu());
		console.log('text end ' + JSON.stringify(setRequvestId));
	}
	let jhjh=true;
	if ((setRequvestId.includes(ctx.from.id))&&(!setRequvest[setRequvestId.indexOf(ctx.from.id)].date)&&(!setRequvest[setRequvestId.indexOf(ctx.from.id)].time)&&(!setRequvest[setRequvestId.indexOf(ctx.from.id)].text))
	{
		console.log('date start ' + JSON.stringify(setRequvestId));
		buf=ctx.message.text;
		buf.trim();
		setRequvest[setRequvestId.indexOf(ctx.from.id)].date=buf;
		console.log(buf);
		ctx.reply('Введи время в формате HH:MM');			
		dateSet=true;
		jhjh=false;
		console.log('date end ' + JSON.stringify(setRequvestId));
	}
	
	if ((setRequvestId.includes(ctx.from.id))&&(setRequvest[setRequvestId.indexOf(ctx.from.id)].date)&&(!setRequvest[setRequvestId.indexOf(ctx.from.id)].time)&&(!setRequvest[setRequvestId.indexOf(ctx.from.id)].text)&&(jhjh))
	{
		console.log('time start ' + JSON.stringify(setRequvestId));
		console.log('setTime');
		var date = new Date()
		buf=ctx.message.text;
		buf.trim();
		let bufTD = returnDateInMilliseckonds(setRequvest[setRequvestId.indexOf(ctx.from.id)].date, buf);
		if ((bufTD>0)&&(Number(date)<bufTD)) {
			date = new Date(bufTD);
			setRequvest[setRequvestId.indexOf(ctx.from.id)].time=Number(date);
			ctx.reply('Задано');
			ctx.reply(date.getDate().toString()+'-'+(date.getMonth()+1).toString()+'-'+date.getFullYear().toString());
			ctx.reply(date.getHours().toString()+':'+date.getMinutes().toString());
			ctx.reply('Укажи текст напоминания');
			console.log('time end ' + JSON.stringify(setRequvestId));
		}
		else {
			ctx.reply('Проверь введенную информацию и повтори');
			setRequvest[setRequvestId.indexOf(ctx.from.id)].date='';
			ctx.reply('Выбери дату или введи в формате DD-MM-YYYY');
		}
	}
	
	if ((userBuffer.id.includes(ctx.from.id))&&(userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].bitchesSet))
	{
		ctx.reply('пока в разработке');
		userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].bitchesSet=false;
		
		if (Number(buf)>0)
			if (userBuffer.id(indexOf(Number(buf)))>=0) 
			{
				ctx.reply(userBuffer.user[userBuffer.id.indexOf(Number(buf))].first_name + ' id: ' + buf + 'Найден. Добавляем?');
				userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].bitches.push(Number(buf));
			}
			else ctx.reply
	}
	
	if ((!setRequvestId.includes(ctx.from.id))&&(!regUserId.includes(ctx.from.id))) {//&&(!userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].bitchesSet)) {
		if ((!userBuffer.id.includes(ctx.from.id))&&(regUserId.includes(ctx.from.id)))
			ctx.reply('Я проверил данные и вас нет в списках\n\nчтобы стать пользователем, откройте меню слева от поля ввода и нажмите старт\n\nПрошу прощения.\nМне не разрешают разговаривать с незнакомцами');
		switch (buf){
			case ('-добавить сотрудника-') :
				if (!userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].hasOwnProperty('bitches')) userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].bitches=[];
				if (!userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].hasOwnProperty('bitchesSet')) userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].bitchesSet=true;
				ctx.reply('Введи ID сотрудника');
				break;
			case ('-удалить аккаунт-') :
				if (userBuffer.id.indexOf(ctx.from.id)>=0)
				{
					if (userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind.length>0){
						for (i=0; i<userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind.length;i++){
							clearTimeout(timerRequvestLocalId[userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[i].id]);
						}
					}
					userBuffer.total--;
					userBuffer.user.splice(userBuffer.id.indexOf(ctx.from.id),1);
					userBuffer.id.splice(userBuffer.id.indexOf(ctx.from.id),1);
					fs.writeFile("users.txt", JSON.stringify(userBuffer), function(error) {
						if(error) throw error;
						console.log('write done');
						let data = fs.readFileSync("users.txt", "utf8");
						console.log(data);
					});
					ctx.replyWithHTML(
						'Аккаунт удален',
						getZeroMenu())
				}
				ctx.reply('кажется, вас нет в списках');
				break;
			case ('-меню напоминаний-') :
				if (userBuffer.id.indexOf(ctx.from.id)>=0)
				{
					if (iForSeach.id.indexOf(ctx.from.id)<0) {
						iForSeach.id.push(ctx.from.id);
						iForSeach.count.push(0);
					}
					else	
						iForSeach.count[iForSeach.id.indexOf(ctx.from.id)]=0;
					let aaaa=[];
					aaaa[0]=['-Список напоминаний-'];
					aaaa[1]=['-Добавить напоминание-'];
					aaaa[2]=['-Вернуться в главное меню-'];
					ctx.replyWithHTML('Меню обновлено', Markup.keyboard(aaaa).resize().extra());
				}
				break;
			case ('-вернуться в главное меню-') :
				if (userBuffer.id.indexOf(ctx.from.id)>=0)
				{
					if (userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].manager)
						ctx.replyWithHTML('Меню обновлено', getMainManagerMenu());
					else 
						ctx.replyWithHTML('Меню обновлено', getMainDeveloperMenu());
				}
				break;
			case ('-далее-'):
				iForSeach.count[iForSeach.id.indexOf(ctx.from.id)] = iForSeach.count[iForSeach.id.indexOf(ctx.from.id)]+1;
			case ('-назад-'):
				buf == '-назад-' ? iForSeach.count[iForSeach.id.indexOf(ctx.from.id)] = (Math.floor(iForSeach.count[iForSeach.id.indexOf(ctx.from.id)]/5)-1)*5 : iForSeach.count[iForSeach.id.indexOf(ctx.from.id)];				
			case ('-список напоминаний-') :
				if (userBuffer.id.indexOf(ctx.from.id)>=0)
				{
					let aaaa=[];
					let i = iForSeach.count[iForSeach.id.indexOf(ctx.from.id)];
					if (i<5) i=0;
					let iid=userBuffer.id.indexOf(ctx.from.id);
					if (userBuffer.user[iid].hasOwnProperty('remind'))
					{
						if (userBuffer.user[iid].remind.length<=(6+i)){
							for (i; i<userBuffer.user[iid].remind.length; i++) aaaa.push('~('+i.toString()+')-' + userBuffer.user[iid].remind[i].text.slice(0, (userBuffer.user[iid].remind[i].text.indexOf(' ', 80)>=0 ? userBuffer.user[iid].remind[i].text.indexOf(' ', 80) : 100))  + (userBuffer.user[iid].remind[i].text.length>=100 ? '...-' : '-'));
							if (i>=6) aaaa.push('-Назад-');
							if (i<=5) aaaa.push('-меню напоминаний-');
						}
						else {
							for (i; i<iForSeach.count[iForSeach.id.indexOf(ctx.from.id)]+5; i++) aaaa.push('~('+i.toString()+')-' + userBuffer.user[iid].remind[i].text.slice(0, (userBuffer.user[iid].remind[i].text.indexOf(' ', 80)>=0 ? userBuffer.user[iid].remind[i].text.indexOf(' ', 80) : 100))  + (userBuffer.user[iid].remind[i].text.length>=100 ? '...-' : '-'));
							aaaa.push('-Далее-');
							if (i>=6) aaaa.push('-Назад-');
							if (i<=5) aaaa.push('-меню напоминаний-');
							iForSeach.count[iForSeach.id.indexOf(ctx.from.id)]=i-1;
						}
					ctx.replyWithHTML('Выбери:', Markup.keyboard(aaaa).resize().extra());
					}
				}
				break;
			case ('-добавить напоминание-') :
				if (userBuffer.id.indexOf(ctx.from.id)>=0)
				{
					let aaaa=[['Одноразовое'],['Повторяемое']];					
					ctx.replyWithHTML('Повторяемое?', Markup.inlineKeyboard([
						Markup.callbackButton('Одноразовое', 'reqOneSet'),
						Markup.callbackButton('Повторяемое', 'reqManySet')
					], {columns: 2}).extra());
				}
				break;
			case ('~удалить-') :
				if (userBuffer.id.indexOf(ctx.from.id)>=0)
				{			
					ctx.replyWithHTML('Вы уверены?', Markup.inlineKeyboard([
						Markup.callbackButton('Да', 'yesDelReq'),
						Markup.callbackButton('Нет', 'noDelReq')
					], {columns: 2}).extra(), Markup.keyboard([['-Вернуться в главное меню-'],['-Список напоминаний-']]).resize().extra());
				}
				break;
			case ('~изменить-') :
				if (userBuffer.id.indexOf(ctx.from.id)>=0)
				{
					let aaaa=[['~Удалить-','~Изменить-'],['-Вернуться в главное меню-'],['-Список напоминаний-']];								
					ctx.replyWithHTML('Что именно поменяем?', Markup.keyboard(aaaa).resize().extra());
					ctx.reply('функция в разработке. пока можешь удалить и добавить новое')
				}
			case ('~изменить-') :
				if (userBuffer.id.indexOf(ctx.from.id)>=0)
				{									
					ctx.replyWithHTML('Что именно поменяем?', Markup.keyboard(aaaa).resize().extra(), Markup.keyboard([['~Дату-', '~Время-'],['~Текст-'],['-Вернуться в главное меню-'],['-Список напоминаний-']]).resize().extra());
				}
				break;
			default :
				if ((buf[0]!='~')&&(buf[1]!='(')) ctx.reply('Сообщение: '+buf);
		}
		if ((buf[0]=='~')&&(buf[buf.length-1]=='-')&&(buf[1]=='(')&&(buf.includes(')')))
		{
			let aaaa=[['~Удалить-','~Изменить-'],['-Вернуться в главное меню-'],['-Список напоминаний-']];
			let cout = Number(buf.slice(2, buf.indexOf(')')));
			var date = new Date(userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[cout].time);
			ctx.reply('Напомнить: \n' + date.getDate().toString() + '-' + (date.getMonth()+1).toString() + '-' + date.getFullYear().toString() + '\n' + date.getHours().toString() + '-' + date.getMinutes().toString());
			if (userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[cout].request>0) ctx.reply('Повторяемое');
			userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[cout].request+=100;
			ctx.replyWithHTML(userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[cout].text, Markup.keyboard(aaaa).resize().extra());
			console.log(JSON.stringify(userBuffer));
		}
	}
}).catch(e => console.log(e));

function yesNoRegKeyboard() {
    return Markup.inlineKeyboard([
        Markup.callbackButton('Да', 'yesReg'),
        Markup.callbackButton('Нет', 'noReg')
    ], {columns: 2}).extra()
};

bot.action(['yesReg', 'noReg', 'yesEndReg', 'manag', 'devel', 'reqOneSet', 'reqManySet', 'yesDelReq', 'noDelReq'], ctx => {
    
	fs.appendFileSync('logs.txt', ('actionId: ' + ctx.from.id)+'\n');
	fs.appendFileSync('logs.txt', ('action: ' + ctx.callbackQuery.data)+'\n\n');
	
	if (ctx.callbackQuery.data === 'yesDelReq') {
		ctx.deleteMessage();
		for (i=0; i<userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind.length; i++) {
			if (userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[i].request>=100) {
				if (userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[i].request%100==0) clearTimeout(timerRequvestLocalId[userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[i].id]);
				if (userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[i].request%100!=0) timerRequvestLocalId[userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[i].id].stop();
				userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind.splice(i,1);
				fs.writeFile("users.txt", JSON.stringify(userBuffer), function(error) {
					if(error) throw error;
					console.log('write done');
				});
				iForSeach.count[iForSeach.id.indexOf(ctx.from.id)]=0;
				break;
			}
		}
		ctx.reply('Удалено');
    } 
	
   
    if (ctx.callbackQuery.data === 'noDelReq') {
		ctx.deleteMessage();
		for (i=0; i<userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind.length; i++) 
			if (userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[i].request>=100) {
				userBuffer.user[userBuffer.id.indexOf(ctx.from.id)].remind[i].request%=100;
				break;
			}
    } 
	
   
    if (ctx.callbackQuery.data === 'reqManySet') {
		ctx.deleteMessage();
		ctx.reply('В разработке');				
		ctx.replyWithHTML('Частота:', Markup.inlineKeyboard([
			Markup.callbackButton('Каждый час', '~reqManySetH'),
			Markup.callbackButton('Каждый день', '~reqManySetD'),
			Markup.callbackButton('Каждая неделя', '~reqManySetW'),
			Markup.callbackButton('Каждый месяц', '~reqManySetM'),
			Markup.callbackButton('Каждый год', '~reqManySetY')
		], {columns: 2}).extra());
		
    } 
	
    if (ctx.callbackQuery.data === 'reqOneSet') {
		if (userBuffer.id.indexOf(ctx.from.id)>=0)
		{
			ctx.deleteMessage();
			var now = new Date();
			let date1 = now.getDate().toString()+'-'+(now.getMonth()+1).toString()+'-'+now.getFullYear().toString();
			now.setMilliseconds(now.getMilliseconds()+1000*3600*24);
			let date2 = now.getDate().toString()+'-'+(now.getMonth()+1).toString()+'-'+now.getFullYear().toString();
			now.setMilliseconds(now.getMilliseconds()+1000*3600*24);
			let date3 = now.getDate().toString()+'-'+(now.getMonth()+1).toString()+'-'+now.getFullYear().toString();
			let aaaa=[[date1],[date2],[date3]];
			setRequvestId.push(ctx.from.id);
			console.log('zadaem: ' + JSON.stringify(setRequvestId));
			let forRequvest = {
				date: '',
				time: 0,
				request: 0,
				timerId: 0,
				text: ''
			}
			setRequvest.push(forRequvest);
			console.log('zadaem: ' + JSON.stringify(setRequvest));
			ctx.replyWithHTML('Выбери дату или введи ее в формате DD-MM-YYYY', Markup.keyboard(aaaa).resize().extra());
		}
    } 
	
    if (ctx.callbackQuery.data === 'yesReg') {
		ctx.deleteMessage();
		ctx.reply('Для начала, введи свое имя');
		regUserId.push(ctx.from.id);
    } 
	
	if (ctx.callbackQuery.data === 'noReg') {
        ctx.deleteMessage();
    }
	
    if (ctx.callbackQuery.data === 'yesEndReg') {
		ctx.deleteMessage();
		console.log('im here');
		let i=0;
		for (i; i<savingData.length; i++) 
			if (savingData[i].id == ctx.from.id)
			{
				console.log('id correct');
				console.log(JSON.stringify(savingData[i]));
				userBuffer.user.push(savingData[i]);
				savingData.splice(i,1);
				console.log('data save');
				userBuffer.id.push(ctx.from.id);
				userBuffer.total++;
				fs.writeFile("users.txt", JSON.stringify(userBuffer), function(error) {
					if(error) throw error;
					console.log('write done');
					let data = fs.readFileSync("users.txt", "utf8");
					console.log(data);
				});
				break;
			}
		ctx.reply('Менеджер или разработчик?', setStatusClient());
    }
	
    if (ctx.callbackQuery.data === 'manag') {
		ctx.deleteMessage();
		for (i=0; i<userBuffer.total; i++)
			if (userBuffer.user[i].id==ctx.from.id)
			{
				userBuffer.user[i].manager=true;
				userBuffer.user[i].first_name=ctx.from.first_name;
				userBuffer.user[i].last_name=ctx.from.last_name;
				userBuffer.user[i].username=ctx.from.username;
				fs.writeFile("users.txt", JSON.stringify(userBuffer), function(error) {
					if(error) throw error;
					console.log('write done');
					let data = fs.readFileSync("users.txt", "utf8");
					console.log(data);
				});
				break;
			}
		ctx.reply('Вы зарегистрированы как руководитель');
		ctx.reply('Ваш идентификатор: \n' + ctx.from.id);	
		ctx.replyWithHTML('Для удобства будет добавлено меню', getMainManagerMenu())		
	}
	
    if (ctx.callbackQuery.data === 'devel') {
		ctx.deleteMessage();
		for (i=0; i<userBuffer.total; i++)
			if (userBuffer.user[i].id==ctx.from.id)
			{
				userBuffer.user[i].manager=false; 
				userBuffer.user[i].first_name=ctx.from.first_name;
				userBuffer.user[i].last_name=ctx.from.last_name;
				userBuffer.user[i].username=ctx.from.username;
				fs.writeFile("users.txt", JSON.stringify(userBuffer), function(error) {
					if(error) throw error;
					console.log('write done');
					let data = fs.readFileSync("users.txt", "utf8");
					console.log(data);
				});
				break;
			}	
		ctx.reply('Вы зарегистрированы как разработчик');	
		ctx.reply('Ваш идентификатор: \n' + ctx.from.id);	
		ctx.replyWithHTML('Для удобства будет добавлено меню', getMainDeveloperMenu())
	}
});

let objCron = {
	stringCron: [],
	id: [],
	locString: []
}

bot.on('callback_query', async (ctx) => {
	
    ctx.answerCbQuery();
    ctx.deleteMessage();
	if (!objCron.id.includes(ctx.from.id)) {
		objCron.id.push(ctx.from.id);
		objCron.stringCron.push('* * * * *');
	}
	let buf = ctx.callbackQuery.data;
	if (buf[0]=='~') 
	{
		if (buf === '~reqManySetH') {
			ctx.replyWithHTML('Укажи дни недели:', Markup.inlineKeyboard([
				Markup.callbackButton('Понедельник', '~%1'),
				Markup.callbackButton('Вторник', '~%2'),
				Markup.callbackButton('Среда', '~%3'),
				Markup.callbackButton('Четверг', '~%4'),
				Markup.callbackButton('Пятница', '~%5'),
				Markup.callbackButton('Суббота', '~%6'),
				Markup.callbackButton('Воскресенье', '~%0'),
				Markup.callbackButton('Готово', '~entWeek')
			], {columns: 1}).extra());
		}
		if (buf[1]=='%')
			if (!objCron.locString.includes(buf[2]))
				objCron.locString+=(buf[2]+',');
		if (buf === '~entWeek') {
			objCron.locString.slice(0,-1);
		}
		
	}
	
}).catch(e => console.log(e));

function yesNoEndRegKeyboard() {
    return Markup.inlineKeyboard([
        Markup.callbackButton('Да', 'yesEndReg'),
        Markup.callbackButton('Нет', 'yesReg')
    ], {columns: 2}).extra()
};

function setStatusClient() {
    return Markup.inlineKeyboard([
        Markup.callbackButton('Менеджер', 'manag'),
        Markup.callbackButton('Разработчик', 'devel')
    ], {columns: 2}).extra()
};

function getMainManagerMenu() {
    return Markup.keyboard([
        ['-Добавить сотрудника-', '-Добавить задачу-'],
        ['-Выбрать сотрудника-', '-Список задач-'],
		['-Меню напоминаний-', '-Удалить аккаунт-']
    ]).resize().extra()
}

function getMainDeveloperMenu() {
    return Markup.keyboard([
        ['-Статус задачи-', '-Проставить время-'],
        ['-Сведения о руководителе-'],
		['-Список задач-'],
		['-Меню напоминаний-', '-Удалить аккаунт-']
    ]).resize().extra()
}

function getZeroMenu() {
    return Markup.keyboard([]).resize().extra()
}

function returnDateInMilliseckonds(date, time)
{
	var now = new Date();
	now.setMilliseconds(0);
	now.setSeconds(0);
	now.setMinutes(0);
	now.setHours(0);
	if (date!='')
	{
		let mdate = ['0','0','0'];
		let j=0;
		for (i=0; i<date.length; i++)
		{
			if ((date[i]=='-')||(date[i]==',')||(date[i]=='.')||(date[i]==':'))
				j++;
			else
				mdate[j]+=date[i];
		}
		now.setDate(Number(mdate[0]));
		now.setMonth(Number(mdate[1])-1);
		now.setFullYear(Number(mdate[2]));
	}
	if (time != '')
	{		
		let mdate = ['0','0'];
		let j=0;
		for (i=0; i<time.length; i++)
		{
			if ((time[i]==':')||(time[i]==',')||(time[i]=='.')||(time[i]=='-'))
				j++;
			else
				mdate[j]+=time[i];
		}
		now.setHours(Number(mdate[0]));
		now.setMinutes(Number(mdate[1]));
	}
	return Number(now);
}

function reqFuncSend(id, text, remId) {
	bot.telegram.sendMessage(id, text);	
	userBuffer.user[userBuffer.id.indexOf(id)].remind.splice(remId, 1);
}

bot.launch();
console.log('bot start');
