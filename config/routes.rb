# frozen_string_literal: true

Rails.application.routes.draw do
  resources :traces, only: [:index, :show]
  resources :transactions, only: [:index, :show]
end