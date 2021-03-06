# frozen_string_literal: true

class RootController < ApplicationController
  layout 'global'

  def index
    # TODO
  end

  def trace
    trace = Trace.find_by id: params[:id].strip

    if trace
      redirect_to trace_path(trace.platform, trace)
    else
      render 'traces/trace_not_found', status: :not_found
    end
  end
end
