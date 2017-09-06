var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/** 
 *  Validators
    String:   custom, required, enum, match
    Number:   custom, required, min, max
    Date:     custom, required
    Buffer:   custom, required
    Boolean:  custom, required
    Mixed:    custom, required
    ObjectId: custom, required
    Array:    custom, required
    
    Below is a demo of "String: custom, required, enum, match"
 **/
const languages = ['English', 'French', 'German', 'Spanish', 'Japanese', 'Chinese'];

mongoose.connect(process.env.DATABASE_URL)
  .then(function() {
  
    const bookSchema = mongoose.Schema({
      title: {
        type: String,
        required: true
      },
      author: [{ name: String }],
      language: {
        type: String, 
        validate: {
          validator: function(input) {
            return languages.indexOf(input) !== -1
          },
          message: 'Language {VALUE} is not a valid!',
          type: 'ValidationError'
        }
      },
      published: Date,
      isbn: {
        type: String,   
        // unique: true,
        match: [ /^\d{9}(\d|X)$/, 'ISBN ({VALUE}) must be match ISBN-10 format']
      },
      inPrint: Boolean,
      price: {type: Number, required: [
        function() {return this.inPrint;},
        'If "inPrint" is "true" then price is required'
      ]},
      
    }); 

    var BookModel = mongoose.model('Book', bookSchema);
  
    BookModel.create({  
      title: 'Catch-22',
      author: { name: 'Joseph Heller'},
      published: '10 November 1961', 
      isbn: '0684833395', //0-684-83339-5
      inPrint: true,
      language: 'English',
      price: 11.99
             
    }).then( ( book ) => { console.log(book) })  
      .catch( ( err ) => { console.log(err) })  
  }); 
        
 
/*  
Any required:
  required: true
  required: [true, '{PATH} is required!']
  required: function() {return !!this.value}
  required: [
    function() { return this.userId != null; },
    'username is required if id is specified'
  ]

Unique (not technically a validator)
Triggers creation of index **when collection is created**
Violation throws a MongoError, not a mongoose error
  type: Any,  
  unique: true

Number: min max
  type: Number,
  min: [6, 'Too few eggs'],
  max: 12

String enum
  type: String,
  enum: ['Coffee', 'Tea'],

String match
  type: String,  
  match: /[a-zA-Z0-9]/

Custom validation
  
  function validator (val) {
    return val == 'something';
  }
  type: Any,
  #validate( <regex | function | object | array>, [messsage], [type] )
  
  validate: validator
  
  √ validate: [validator, 'Error in {PATH}. "{VALUE}" does not equal "something".']
  
  validate: [
      { validator: validator, msg: 'Error in {PATH}. "{VALUE}" does not equal "something".' }, 
      { validator: anotherValidator, msg: 'failed' }
  ]

  validate: {
    validator: function(v) {
      return /\d{3}-\d{3}-\d{4}/.test(v);
    },
    message: '{VALUE} is not a valid!',
    type: 'Error Type'
  }

  
    type: String,
    validate: function(val) {
      return fetch(url).then( result => !!result)      
    }
  



Nested Objects

Error Message template
  {PATH} the invalid document path
  {VALUE} the invalid value
  {TYPE} the validator type such as "regexp", "min", or "user defined"
  {MIN} {MINLENGTH} the declared value min | minlength
  {MAX} {MAXLENGTH} the declared value max | maxlength

Error Object 
  name: 'ValidationError',
  errors: {
    '<path>': {
      message: ' `foo` not valid',
      kind: 'Invalid color',
      path: 'color',
      value: 'grease'
    }
  }
    
*/
