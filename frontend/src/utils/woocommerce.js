import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const WooCommerce = new WooCommerceRestApi({
  url: 'http://example.com', // Replace with the actual store URL
  consumerKey: 'consumer_key', // Replace with the actual consumer key
  consumerSecret: 'consumer_secret', // Replace with the actual consumer secret
  version: 'wc/v3'
});

export default WooCommerce;
