module.exports = function (mongoose) {
    var module = {};

    var clientSchema = mongoose.Schema({
      name : String,
      center : String,
      image : String,
      web_url: String,
      template_type : String,
      enabled : Boolean,
      page_content: {
        title : String,
        subtitle: String,
        features: Array,
        iframe_enabled : Boolean,
        chat_enabled : Boolean,
        chat_email : String,
        iframe_content : Object,
        social_networks : {
          facebook : {enabled: Boolean, url: String},
          twitter : {enabled: Boolean, url: String},
          google_plus : {enabled: Boolean, url: String},
          instagram : {enabled: Boolean, url: String},
          youtube:{enabled: Boolean, url: String}
        }
      },
      client_data : Object
    });

    module.clientModel = mongoose.model('Client', clientSchema);

    return module;
}
