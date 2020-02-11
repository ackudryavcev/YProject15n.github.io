const rootDoc = document.querySelector('.root');
const FormEdit = document.forms.edit;
const FormNew = document.forms.new;
const FormAvatar = document.forms.avatar;
let cardlist;
class Card {
  constructor(imgSrc, cardName, numberLikes, idCard, isLike) {
    this.cardElement = this.createCard(imgSrc, cardName, numberLikes, idCard, isLike);
    this.idCard = idCard;
  }
  createCard(imgSrc, cardName, numberLikes, idCard, isLike) {
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('place-card');
    const imgElement = document.createElement('div');
    imgElement.classList.add('place-card__image');
    imgElement.style = `background-image: url(${imgSrc})`;
    const btnElement = document.createElement('button');
    btnElement.classList.add('place-card__delete-icon');
    imgElement.appendChild(btnElement);
    btnElement.addEventListener('click', () => this.remove.call(cardContainer, idCard));
    const titleElement = document.createElement('div');
    titleElement.classList.add('place-card__description');
    const titleH3Element = document.createElement('h3');
    titleH3Element.classList.add('place-card__name');
    titleH3Element.textContent = cardName;
    titleElement.appendChild(titleH3Element);
    const titleNbrElement = document.createElement('span');
    titleNbrElement.classList.add('place-card__number-likes');
    titleNbrElement.textContent = numberLikes;
    titleElement.appendChild(titleNbrElement);
    const titleBtnElement = document.createElement('button');
    titleBtnElement.classList.add('place-card__like-icon');
    if (isLike) { titleBtnElement.classList.add('place-card__like-icon_liked'); }
    titleElement.appendChild(titleBtnElement);
    titleBtnElement.addEventListener('click', () => this.like.call(titleBtnElement, idCard, titleNbrElement));
    cardContainer.appendChild(imgElement);
    cardContainer.appendChild(titleElement);
    return cardContainer;
  }
  // Лайк карточки
  like(id, span) {
    const apiCard = new Api({
      baseUrl: `http://95.216.175.5/cohort1/cards/like/${id}`,
      headers: {
        authorization: '4cd1af71-d8c1-4879-9c1f-536369240472',
        'Content-Type': 'application/json'
      }
    });

    if (!this.classList.contains("place-card__like-icon_liked")) {
      apiCard.method = 'PUT';
      apiCard.likeData(span);
    }
    else {
      apiCard.method = 'DELETE';
      apiCard.likeData(span);
    }
    this.classList.toggle('place-card__like-icon_liked');
  }
  // Удаление карточки
  remove(id) {
    const apiCard = new Api({
      baseUrl: `http://95.216.175.5/cohort1/cards/${id}`,
      headers: {
        authorization: '4cd1af71-d8c1-4879-9c1f-536369240472',
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    });
    if (confirm('Вы действительно хотите удалить эту карточку?')) {
      apiCard.deleteDataCard(this);
    }
  }
}
class CardList {
  constructor(container, cards) {
    this.container = container;
    this.cards = cards;
    this.render();
  }
  // Добавление карточек
  addCard(imgSrc, cardName, numberLikes, idCard, isLike) {
    const { cardElement } = new Card(imgSrc, cardName, numberLikes, idCard, isLike);
    this.container.appendChild(cardElement);
  }
  // Прорисовка карточек на странице
  render() {
    for (let i = 0; i < this.cards.length; i++) {
      let isLike = this.cards[i].likes.find(like => like._id === "fab22160e266040d464bab57");
      if (isLike) { isLike = true } else { isLike = false }
      this.addCard(this.cards[i].link, this.cards[i].name, this.cards[i].likes.length, this.cards[i]._id, isLike);
    }
  }
}
class Popup {
  constructor(container, name, about, image, avatar) {
    this.container = container;
    this.name = name;
    this.about = about;
    this.image = image;
    this.avatar = avatar;
  }
  // Открыть Попап окно
  open() {
    this.container.classList.toggle('popup_is-opened');
    if (this.name && this.about) {
      this.name.value = document.querySelector('.user-info__name').textContent;
      this.about.value = document.querySelector('.user-info__job').textContent;
      validate(this.name, document.querySelector(".popup__edit_error"));
      validate(this.about, document.querySelector(".popup__about_error"));
    }
    else if (this.image) {
      document.querySelector('.popup__image').style.backgroundImage = this.image;
    }
    else if (this.avatar) {
      validate(FormAvatar.elements.link, document.querySelector(".popup__link_error_avatar"));
      validateButton(FormAvatar.elements.link, FormAvatar.elements.link, FormAvatar.elements.button);
    }
    else {
      validate(FormNew.elements.name, document.querySelector(".popup__add_error"));
      validate(FormNew.elements.link, document.querySelector(".popup__link_error"));
      validateButton(FormNew.elements.name, FormNew.elements.link, FormNew.elements.button);
    }
  }
  // Закрыть попап окно
  close() {
    this.container.classList.remove('popup_is-opened');
  }
}
// класс запросов
class Api {
  constructor(request) {
    this.headers = request.headers;
    this.baseUrl = request.baseUrl;
    this.method = request.method;
    this.body = request.body;
  }
  // подгрузка и прорисовка карточек
  getInitialCards() {
    fetch(this.baseUrl, {
      headers: this.headers
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
      .then((result) => {
        cardlist = new CardList(document.querySelector('.places-list'), result);
      })
      .catch((err) => {
        console.log(`ошибка - ${err}`);
      });
    /* Отлично, здесь все выполняется корректно.
    *
    * */
  }
  // загрузка Профиля
  getLoadProfile() {
    const name = document.querySelector('.user-info__name');
    const about = document.querySelector('.user-info__job');
    const image = document.querySelector('.user-info__photo');
    fetch(this.baseUrl, {
      headers: this.headers
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
      .then((result) => {
        name.textContent = result.name;
        about.textContent = result.about;
        image.style.backgroundImage = `url(${result.avatar})`;
      })
      .catch((err) => {
        console.log(`ошибка - ${err}`);
      });
  }
  // отправка данных - карточка и профиль
  sendDataCard(form, button) {
    fetch(this.baseUrl, {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body)
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
      .then(result => {
        cardlist.addCard(result.link, result.name, result.likes.length, result._id);
      })
      .catch((err) => {
        console.log(err); // выведем ошибку в консоль
      })
      .finally(() => {
        form.reset();
        button.classList.remove('popup__button-active');
        const popup = new Popup(document.querySelector('.popup-add'));
        popup.close();
        loading(button, "+");
      });
  }
  sendDataProfile(form, button, popupEdit) {
    const name = document.querySelector('.user-info__name');
    const about = document.querySelector('.user-info__job');
    fetch(this.baseUrl, {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body)
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
      .then((result) => {
        name.textContent = result.name;
        about.textContent = result.about;

      })
      .catch((err) => {
        console.log(err); // выведем ошибку в консоль
      })
      .finally(() => {
        form.reset();
        popupEdit.close();
        loading(button, "Сохранить");
      });
  }
  sendDataAvatar(form, button, popupAvatar) {
    const image = document.querySelector('.user-info__photo');
    fetch(this.baseUrl, {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body)
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
      .then((result) => {
        image.style.backgroundImage = `url(${result.avatar})`;
      })
      .catch((err) => {
        console.log(err); // выведем ошибку в консоль
      })
      .finally(() => {
        form.reset();
        popupAvatar.close();
        loading(button, "Сохранить");
      });
  }
  deleteDataCard(card) {
    fetch(this.baseUrl, {
      method: this.method,
      headers: this.headers
    })
      .catch((err) => {
        console.log(err); // выведем ошибку в консоль
      })
      .finally(() => {
        cardlist.container.removeChild(card);
      });
  }
  // лайки
  likeData(span) {
    fetch(this.baseUrl, {
      method: this.method,
      headers: this.headers
    }).then(res => {
      if (res.ok) {
        return res.json();
      }
    }).then((result) => {
      span.textContent = result.likes.length;
    })
      .catch((err) => {
        console.log(err); // выведем ошибку в консоль
      });

  }
}
// запрос на карточки
const api = new Api({
  baseUrl: 'http://95.216.175.5/cohort1/cards',
  headers: {
    authorization: '4cd1af71-d8c1-4879-9c1f-536369240472'
  }
});
// отрисовываем карточки
api.getInitialCards();

// загрузка профиля
const apiProfile = new Api({
  baseUrl: 'http://95.216.175.5/cohort1/users/me',
  headers: {
    authorization: '4cd1af71-d8c1-4879-9c1f-536369240472'
  }
});
apiProfile.getLoadProfile();
// Функции
// Валидация полей формы
function validate(input, span) {
  if (!input.validity.valid) {
    if (input.validity.valueMissing) { span.textContent = "Это обязательное поле" }
    else if (input.validity.typeMismatch) { span.textContent = "Здесь должна быть ссылка" }
    else { span.textContent = "Должно быть от 2 до 30 символов" }
    span.classList.add('popup__error_visible')
  }
  else { span.classList.remove('popup__error_visible') }
}
// Делаем кнопку активной/неактивной
function validateButton(input1, input2, button) {
  if (!input1.validity.valid || !input2.validity.valid) {
    button.classList.remove('popup__button-active');
  }
  else { button.classList.add('popup__button-active'); }
}
// Создание новой карточки
function newCard(event) {
  const form = document.forms.new;
  const name = form.elements.name.value;
  const link = form.elements.link.value;
  const button = form.elements.button;
  event.preventDefault();
  if (name && link) {
    loading(button, "+");
    const apiCard = new Api({
      baseUrl: 'http://95.216.175.5/cohort1/cards',
      headers: {
        authorization: '4cd1af71-d8c1-4879-9c1f-536369240472',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: {
        name: form.elements.name.value,
        link: form.elements.link.value
      }
    });
    apiCard.sendDataCard(form, button);
  }
}
// Редактирование профиля
function editProfile(event) {
  const popupEdit = new Popup(document.querySelector('.popup-edit'), FormEdit.elements.name, FormEdit.elements.about);
  const form = document.forms.edit;
  const button = form.elements.button;
  event.preventDefault();
  loading(button, "Сохранить");
  const apiProfile = new Api({
    baseUrl: 'http://95.216.175.5/cohort1/users/me',
    headers: {
      authorization: '4cd1af71-d8c1-4879-9c1f-536369240472',
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: {
      name: form.elements.name.value,
      about: form.elements.about.value
    }
  });
  apiProfile.sendDataProfile(form, button, popupEdit);
}
// Редактирование аватара
function editAvatar(event) {
  const popupAvatar = new Popup(document.querySelector('.popup-avatar'), '', '', '', FormAvatar.elements.link);
  const form = document.forms.avatar;
  const button = form.elements.button;
  console.log(form.elements.link.value);
  event.preventDefault();
  loading(button, "Сохранить");
  const apiAvatar = new Api({
    baseUrl: 'http://95.216.175.5/cohort1/users/me/avatar',
    headers: {
      authorization: '4cd1af71-d8c1-4879-9c1f-536369240472',
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: {
      avatar: form.elements.link.value
    }
  });
  apiAvatar.sendDataAvatar(form, button, popupAvatar);

}
// Функция процесса загрузки
function loading(button, text) {
  if (button.textContent == text) {
    button.textContent = "Загрузка..."
  }
  else { button.textContent = text }
}
// Слушатель страницы
rootDoc.addEventListener('click', function (event) {
  const popup = new Popup(document.querySelector('.popup-add'));
  const popupEdit = new Popup(document.querySelector('.popup-edit'), FormEdit.elements.name, FormEdit.elements.about);
  const popupImage = new Popup(document.querySelector('.popup-img'), '', '', event.target.style.backgroundImage);
  const popupAvatar = new Popup(document.querySelector('.popup-avatar'));
  // Открыть окно добавления карточки
  if (event.target.classList.contains('user-info__button')) {
    popup.open();
  }
  // Закрыть окно добавления карточки
  if (event.target.classList.contains('popup__close')) {
    popup.close();
  }
  //  Открыть окно Редактировать профиль
  if (event.target.classList.contains('user-info__button-edit')) {
    popupEdit.open();
  }
  //  Закрыть окно редактировать профиль
  if (event.target.classList.contains('popup__close-edit')) {
    popupEdit.close();
  }
  // Открыть окно редактировать аватар
  if (event.target.classList.contains('user-info__photo')) {
    popupAvatar.open();
  }
  // Закрыть окно редактировать аватар
  if (event.target.classList.contains('popup__close-avatar')) {
    popupAvatar.close();
  }
  // Клик по картинке - увеличиваем картинку
  if (event.target.classList.contains('place-card__image')) {
    popupImage.open();
  }
  // Закрываем увеличенную картинку
  if (event.target.classList.contains('popup__close-image')) {
    popupImage.close();
  }
});
// Добавляем карточку
document.forms.new.addEventListener('submit', newCard);
// Редактируем профиль
document.forms.edit.addEventListener('submit', editProfile);
// Меняем аватар
document.forms.avatar.addEventListener('submit', editAvatar);
// Валидация форм
// Форма редактировать профиль
FormEdit.addEventListener('input', function () {
  const ButtonEdit = FormEdit.elements.button;
  const Name = FormEdit.elements.name;
  const About = FormEdit.elements.about;
  const NameSpan = document.querySelector(".popup__edit_error");
  const AboutSpan = document.querySelector(".popup__about_error");
  validate(Name, NameSpan);
  validate(About, AboutSpan);
  validateButton(Name, About, ButtonEdit);
});
// Форма добавления карточки
FormNew.addEventListener('input', function () {
  const ButtonEdit = FormNew.elements.button;
  const Name = FormNew.elements.name;
  const Link = FormNew.elements.link;
  const NameSpan = document.querySelector(".popup__add_error");
  const LinkSpan = document.querySelector(".popup__link_error");
  validate(Name, NameSpan);
  validate(Link, LinkSpan);
  validateButton(Name, Link, ButtonEdit);
});
// Форма добавления карточки
FormAvatar.addEventListener('input', function () {
  const ButtonEdit = FormAvatar.elements.button;
  const Link = FormAvatar.elements.link;
  const LinkSpan = document.querySelector(".popup__link_error_avatar");
  validate(Link, LinkSpan);
  validateButton(Link, Link, ButtonEdit);
});