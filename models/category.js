var mongoose = require('mongoose');

var articeShema = mongoose.Schema({
  title: {
    type: String,
    index: true,
    require: true
  },

  description: {
    type: String,

  },
  date: {
    type: Date,
    default: Date.now
  }
});

var Category = module.exports = mongoose.model('Category', articeShema);

module.exports.getCategories = function (callback) {
  Category.find(callback);
}

module.exports.getCategoriesById = function(id, callback) {
  Category.findBy(id, callback);

}

module.exports.getArticlesByCategory = function (category, callback) {
  var query =  {category: category};
  Aricle.find(query,callback);
}

module.exports.createCategory = function(newCategory, callback){
  newCategory.save(callback);
}


module.exports.create = function (newCategory, callback) {
  newCategory.save(callback);
}
module.exports.updateCategory = function(id, data, callback) {
  var title = data.title,
    description = data.description,
    date = Date.now;

    Category.findById(id, function(err, category) {
      if(!category) {
        return next(new Error('Could not load category'));
      } else {
        category.title = title;
        category.description = description;
        category.date = date;

        category.save(callback);
      }
    });

}


module.exports.removeCategory = function(id, callback) {
  Category.find({_id: id}).remove(callback);
}


//module.exports.add = function (Category)
