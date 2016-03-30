(ns clj.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [net.cgrand.enlive-html :as html]
            [ring.middleware.reload :as reload]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))

(html/deftemplate javascript_search "html/Javascript_Search.html"
  []
  [:fake] (html/content "")
  )
 
(defn query []
  (javascript_search))
   
(defroutes app-routes
  (GET "/" [] (query))
  (GET "/connection-test" [] "success")
  (route/resources "resources/public")
  (route/not-found "Not Found"))
 
(def app
  (-> (wrap-defaults app-routes site-defaults)
      reload/wrap-reload))
 
