const { Telegraf } = require('telegraf');
const bot = new Telegraf('5434295456:AAHIna38OmszBNQGkJQeC1eBNyDmMkZIix0');
const fs = require("fs");
const Markup = require("telegraf/markup.js");

let fileContent = fs.readFileSync("users.txt", "utf8");
let userBuffer = JSON.parse(fileContent);
userBuffer.user=[];
let savingData = [];
let regUserId = [];

var regexp = /^[a-z\s]+$/i;
var reg = /^[а-яёa-z]*$/i;

bot.start((ctx) => {
	ctx.reply('Привет. Попробуем начать работу')
	if (userBuffer.total) {
		for (i=0; i<userBuffer.total; i++)
		{
			if (userBuffer.user[i].id==ctx.from.id) ctx.reply(userBuffer.user[i].name + ', что бы ты хотел сделать?');
			break;
		}
	}
	else {
      ctx.replyWithHTML(
        'Судя по всему, ты здесь впервые\n'+
        'Зарегистрируешься?',
        yesNoRegKeyboard())
		//ctx.reply('Судя по моим записям, мы не знакомы. Познакомимся?');		
		 //ctx.replyWithHTML('блядство ' + yesNoRegKeyboard());
	}
});
bot.help((ctx) => ctx.reply('Я представляю из себя бота-планировщика задач'));

bot.on('text', async ctx => {
	var buf = ctx.message.text;
	buf=buf.trim();
	buf=buf.toLowerCase();
	if (regUserId.includes(ctx.from.id)) {
		regUserId.pop(regUserId.indexOf(ctx.from.id));
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
	else {
		switch (buf){
			case ('удалить аккаунт') :
				let i=0;
				for (i; i<userBuffer.total; i++)
				{
					if (userBuffer.user[i].id==ctx.from.id)
					{
						userBuffer.total--;
						userBuffer.user.pop(i);
						fs.writeFile("users.txt", JSON.stringify(userBuffer), function(error) {
							if(error) throw error;
							console.log('write done');
							let data = fs.readFileSync("users.txt", "utf8");
							console.log(data);
						});
						ctx.replyWithHTML(
							'Аккаунт удален',
							getZeroMenu())
						break;
					}
					ctx.reply('кажется, вас нет в списках');
				}
				break;
			default :
				ctx.reply('Сообщение: '+buf);
		}
	}
});

function yesNoRegKeyboard() {
    return Markup.inlineKeyboard([
        Markup.callbackButton('Да', 'yesReg'),
        Markup.callbackButton('Нет', 'noReg')
    ], {columns: 2}).extra()
};

bot.action(['yesReg', 'noReg', 'yesEndReg', 'manag', 'devel'], ctx => {
    if (ctx.callbackQuery.data === 'yesReg') {
		ctx.reply('Для начала, введи свое имя');
		regUserId.push(ctx.from.id);
    } 
	
	if (ctx.callbackQuery.data === 'noReg') {
        ctx.deleteMessage();
    }
	
    if (ctx.callbackQuery.data === 'yesEndReg') {
		console.log('im here');
		let i=0;
		for (i; i<savingData.length; i++) 
			if (savingData[i].id == ctx.from.id)
			{
				console.log('id correct');
				userBuffer.user.push(savingData[i]);
				savingData.pop(i);
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
        ['Добавить сотрудника', 'Добавить задачу'],
        ['Выбрать сотрудника', 'Список задач'],
		['Задать напоминание', 'Удалить аккаунт']
    ]).resize().extra()
}

function getMainDeveloperMenu() {
    return Markup.keyboard([
        ['Статус задачи', 'Проставить время'],
        ['Сведения о руководителе'],
		['Список задач'],
		['Задать напоминание', 'Удалить аккаунт']
    ]).resize().extra()
}

function getZeroMenu() {
    return Markup.keyboard([]).resize().extra()
}

bot.launch();
console.log('bot start');
