const Card = require('../models/card');
const Error500 = require('../errors/500-err');
const NotFoundError = require('../errors/not-found-err');

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => next(new Error500(`Ошибка при создании карточки -- ${err.message}`)));
};

module.exports.getAllCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch(() => next(new Error500('Ошибка при чтении всех карточек')));
};


module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.id)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (JSON.stringify(card.owner) !== JSON.stringify(req.user._id)) {
        const notCardOwner = new Error('Карта не ваша! Удалить нельзя!');
        notCardOwner.statusCode = 403;
        throw notCardOwner;
      }
      Card.remove(card)
        .then((cardToDelete) => res.send(cardToDelete !== null ? { data: card } : { data: 'Nothing to delete' }))
        .catch(() => { throw new Error500('Ошибка при удалении карты'); });
    })
    .catch((err) => next(err.statusCode ? err : new NotFoundError('Такой карты нет')));
};
