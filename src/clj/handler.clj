(ns clj.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [net.cgrand.enlive-html :as html]
            [ring.middleware.reload :as reload]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))

(html/deftemplate main-template "html/index.html"
  []
  [:h2] (html/content "Train Schedules"))

(html/deftemplate blog-template "html/blog.html"
  []
  [:fake] (html/content ""))


(defn index []
  (main-template))

(defn blog []
  (blog-template))

(defn fetch-route [depart arrive time]
  "fetch times from trafikverket API. Return JSON")
   
(defroutes app-routes
  (GET "/" [] (index))
  (GET "/fetchroute" [req] (fetch-route req))
  (GET "/blog" [] (blog))
  (route/resources "resources/public")
  (route/not-found "Not Found"))
 
(def app
  (-> (wrap-defaults app-routes site-defaults)
      reload/wrap-reload))
 
