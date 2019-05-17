import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chaiNock from 'chai-nock';
import chaiAsPromised from 'chai-as-promised';
import path from 'path';
import nock from 'nock';

import server from '../server';
import resetDatabase from '../utils/resetDatabase';

chai.use(chaiHttp);
chai.use(chaiNock);
chai.use(chaiAsPromised);



// tout les packages et fonction nescessaire au test sont importé ici, bon courage

// fait les Tests d'integration en premier

describe('Test intégration (Empty database)', () => {  //tests pour voir si la db vide marche 
    let emptyBooks = {
        books: []
    }
    beforeEach(() => {
    	//reset la db avant un test
        resetDatabase(path.normalize(`${__dirname}/../data/books.json`), emptyBooks);
    })
    it('should send empty books', done => {  // du coup la db est vide donc ca revoie une 200 + empty
        chai
            .request(server)
            .get('/book')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.books).to.be.a('array');
                expect(res.body.books.length).to.equal(0);
                done();
            });
    })
    it('should add a book ', done => {  // on add un livre et ça retourne un 200 + confirmation
        chai
            .request(server)
            .post('/book')
            .send({
                "id": "55b7d315-1a5f-4b13-a665-c382a6c71756",
                "title": "H2G2 le guide du voyageur galactique",
                "years": "2015",
                "pages": "650"
            })
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.equal('book successfully added');
                done();
            });

    })

});

describe('Test intégration (Mocked Database)', () => { //tests pour voir si la db vide marche 
    let book = {
        books: [{
            'id': '0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9',
            'title': 'H3G3 le guide du voyageur galactique',
            'years': 1990,
            'pages': 400
        }]
    }
    beforeEach(() => {
        resetDatabase(path.normalize(`${__dirname}/../data/books.json`), book);
    })

    it('should update data about a book', done => {  // on edite le livre et ça retourne un 200 + confirmation
        chai
            .request(server)
            .put('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9/')
            .send({
                "title": "Pas fou la saison 2 de One Punch Man"
            })
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body.message).to.be.a('string');
                expect(res.body.message).to.equal('book successfully updated');
                done();
            });

    })


    it('should retrieve data about a book in function of id', done => { // on récupère les infos d'un book ça retourne un 200 + les bonnes infos
        chai
            .request(server)
            .get('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.equal('book fetched');
                expect(res.body.book).to.be.a('object');
                expect(res.body.book.years).to.be.a('number');
                expect(res.body.book.years).to.equal(1990);
                expect(res.body.book.pages).to.be.a('number');
                expect(res.body.book.pages).to.equal(400);
                expect(res.body.book.title).to.be.a('string');
                expect(res.body.book.title).to.equal( 'H3G3 le guide du voyageur galactique');
                done();
            });
    })

    it('should delete a book', done => { //  on suprime le book fait avant et on choppe un 200 + confirmation
        chai
            .request(server)
            .delete('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.equal('book successfully deleted');
                done();
            });
    })
})

describe('Test unitaire (simulation ok)', () => { //on simule des reponses et on verifie que c'est ce qui est attendu

    beforeEach(()=>{
        nock.cleanAll()
    })
    it('should send http status 200 and send an array',done=>{ //test unitaire pour confirmer que un get /book renvoie un 200 array 
        let emptyBooks = {
            books: []
        }
        nock("http://localhost:8080")
        .get('/book')
        .reply(200,emptyBooks)
            chai
            .request('http://localhost:8080')
            .get('/book')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.books).to.be.a('array');
                done();
            });
    })
    it('should send http status 200 and send a message for post',done=>{  //test unitaire pour confirmer que l'on add bien le livre
        let message = {
            message: 'book successfully added'
        }
        nock("http://localhost:8080")
        .post('/book')
        .reply(200,message)
            chai
            .request('http://localhost:8080')
            .post('/book')
            .send({
                "id": "55b7d315-1a5f-4b13-a665-c382a6c71756",
                "title":"H4G4 le guide du voyageur galactique",
                "years": "2015",
                "pages": "650"
            })
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.be.a('string');
                expect(res.body.message).to.equal('book successfully added');
                done();
            });
    })
    it('should send http status 200 and send a message  for put',done=>{ //test unitaire pour confirmer que le livre est bien modifié
        let message = {
            message: 'book successfully updated'
        }
        nock("http://localhost:8080")
        .put('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
        .reply(200,message)
            chai
            .request('http://localhost:8080')
            .put('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
            .send({
                "pages": "650"
            })
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.be.a('string');
                expect(res.body.message).to.equal('book successfully updated');
                done();
            });
    })
    it('should send http status 200 and send a message for delete',done=>{ //test unitaire pour confirmer que le livre est suprimmé
        let message = {
            message: 'book successfully deleted'
        }
        nock("http://localhost:8080")
        .delete('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
        .reply(200,message)
            chai
            .request('http://localhost:8080')
            .delete('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.be.a('string');
                expect(res.body.message).to.equal('book successfully deleted');
                done();
            });
    })

    it('should send http status 200 and send an message for get',done=>{ //test unitaire pour confirmer qu'on peux get le livre
        let data = {
            message: 'book fetched',
            book : {
                'id': '0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9',
                'title': 'H5G5 le guide du voyageur galactique',
                'years': 1990,
                'pages': 400
            }
        }
        nock("http://localhost:8080")
        .get('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
        .reply(200,data)
            chai
            .request('http://localhost:8080')
            .get('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.be.a('string');
                expect(res.body.message).to.equal('book fetched');
                expect(res.body.book).to.be.a('object');
                expect(res.body.book.years).to.be.a('number');
                expect(res.body.book.years).to.equal(1990);
                expect(res.body.book.pages).to.be.a('number');
                expect(res.body.book.pages).to.equal(400);
                expect(res.body.book.title).to.be.a('string');
                expect(res.body.book.title).to.equal('H5G5 le guide du voyageur galactique');
                done();
            });
    })
})

describe('Test unitaire (simulation mauvaise réponse)', () => {

    beforeEach(()=>{
        nock.cleanAll()
    })
    it('should send http status 400 and send an message',done=>{ //test si une erreur lorsqu'on get /book
        let message = {
            message : 'error fetching books'
        }
        nock("http://localhost:8080")
        .get('/book')
        .reply(400,message)
            chai
            .request('http://localhost:8080')
            .get('/book')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(400);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.be.a('string');
                expect(res.body.message).to.equal('error fetching books');
                done();
            });
    })

    it('should send http status 400 and send an message  for post ',done=>{   //test si une erreur lorsqu'on post un book
        let message = {
            message: 'error adding the book'
        }
        nock("http://localhost:8080")
        .post('/book')
        .reply(400,message)
            chai
            .request('http://localhost:8080')
            .post('/book')
            .send({
                "id": "55b7d315-1a5f-4b13-a665-c382a6c71756",
                "title": "H6G6 le guide du voyageur galactique",
                "years": "2015",
                "pages": "650"
            })
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(400);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.be.a('string');
                expect(res.body.message).to.equal('error adding the book');
                done();
            });
    })
    it('should send http status 400 and send an message for put',done=>{   //test si une erreur lorsqu'on edite un book
        let message = {
            message: 'error updating the book'
        }
        nock("http://localhost:8080")
        .put('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
        .reply(400,message)
            chai
            .request('http://localhost:8080')
            .put('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
            .send({
                "pages": "650"
            })
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(400);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.be.a('string');
                expect(res.body.message).to.equal('error updating the book');
                done();
            });
    })
    it('should send http status 400 and send an message for delete',done=>{  //test si une erreur lorsqu'on delete un book
        let message = {
            message: 'error deleting the book'
        }
        nock("http://localhost:8080")
        .delete('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
        .reply(400,message)
            chai
            .request('http://localhost:8080')
            .delete('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
            .end((err, res) => {
                if (err) console.log(err);
                expect(res).to.have.status(400);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.be.a('string');
                expect(res.body.message).to.equal('error deleting the book');
                done();
            });
    })

    it('should send http status 200 and send an message for get',done=>{  //test si une erreur lorsqu'on cherche livre non existant
        let data = {
            message: 'book does not exist',
        }
        nock("http://localhost:8080")
        .delete('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
        .reply(400,data)
            chai
            .request('http://localhost:8080')
            .delete('/book/55b7d315-1a5f-4b13-a665-c382a6c71756')
            .end((err, res) => {
                if (err) console.log(err)
                expect(res).to.have.status(400)
                expect(res.body).to.be.a('object')
                expect(res.body.message).to.be.a('string')
                expect(res.body.message).to.equal('book does not exist')
                done()
            });
    })
})


