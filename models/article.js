var mongoose = require('mongoose');

var articleShema = mongoose.Schema({
  title: {
    type: String,
    index: true,
    require: true
  },
  body: {
    type: String,
    required: true
  },
  category: {
    type: String,
    index: true,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

var Article = module.exports = mongoose.model('Article', articleShema);

module.exports.getArticles = function (callback) {
  Article.find(callback);
}

module.exports.getArticleById = function(id, callback) {
  Article.findById(id, callback);

}

module.exports.getArticlesByCategory = function (category, callback) {
  var query =  {category: category};
  Article.find(query,callback);
}

module.exports.create = function (newArticle, callback) {
  newArticle.save(callback);
}
module.exports.updateArticle = function(id, data, callback) {
  var title = data.title,
    body = data.body,
    category = data.category,
    query = {_id: id};

    Article.findById(id, function(err, article) {
      if(!article) {
        return next(new Error('Could not load article'));
      } else {
        article.title = title;
        article.body = body;
        article.category = category;

        article.save(callback);
      }
    });

}


module.exports.removeArticle = function(id, callback) {
  Article.find({_id: id}).remove(callback);
}
