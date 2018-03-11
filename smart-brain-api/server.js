const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'mariasql',
  connection: {
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    db : 'Smart_Brain_Api'
  }
});

db.select('*').from('Users').then(data =>{
	console.log(data);
});
const app = express();

app.use(bodyParser.json());
app.use(cors());


app.get('/', (req, res) => {
	res.send();
})

app.post('/signin',(req, res) => 
{
	db.select('LoginEmail','LoginHash').from('Login')
	.where('LoginEmail','=',req.body.email)
	.then(data => {
		const isValid = bcrypt.compareSync(req.body.password,data[0].hash)
		if(isValid)
		{
			return db.select('*').from('User')
			.where('UserEmail','=', req.body.email)
			.then(user => {
				res.json(user[0])
			})
			.catch(err => res.status(400).json('unable to get user'))
		}
		else
		{
			res.status(400).json('Wrong credentials');
		}
	})
	.catch(err => res.status(400).json('Wrong credentials'))

})

app.post('/register',(req, res) => 
{
 	const {email, name, password} = req.body;

 	const hash = bcrypt.hashSync(password);

 	db.transaction(trx => {
 		trx.insert({
 			hash:hash,
 			email:email
 		})
 		.into('login')
 		.returning('email')
 		.then(loginEmail => {
 			return trx('Users')
			.returning('*')
			.insert({
				UsersEmail:loginEmail[0],
				UsersName:name,
				UsersJoined:new Date()
			}).then(user => {

				return res.json(user[0]);	
			})
 		})
 		.then(trx.commit)
 		.catch(trx.rollback)	
 	})
	.catch(err => res.status(400).json('unable to register'))
 	
})

app.get('/profile/:id',(req, res) => 
{
	const {id} = req.params;
	
	db.select('*').from('Users').where({id})
	.then(user => {
		if(user.length)
		{
			res.json(user[0]);
		}else
		{
			res.status(400).json('not found')
		}
	}).catch(err => res.status(400).json('error getting user'))

	
})

app.put('/image',(req, res) => {
	const {id} = req.body;

	db('Users').where('id','=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	}).catch(err => res.status(400).json('unable to get count for entries'));
})




app.listen(3000, () =>{

})