class Span < ActiveRecord::Base
  include Duration

  attribute :start, ::Mnemosyne::Types::PreciseDateTime.new
  attribute :stop, ::Mnemosyne::Types::PreciseDateTime.new

  belongs_to :trace

  def title
    case name
      when 'rails.process_action.action_controller'
        meta['controller'] + '#' + meta['action']
      when 'db.query'
        meta['sql']
      when 'custom.trace'
        "custom.trace: #{meta['name']} #{meta['meta'].to_json}"
      when /external\.http\.\w+(\.\w+)?/
        "external.http: #{meta['method']} #{meta['url']}"
      else
        name
    end
  end

  def style
    trace_duration = trace.duration

    width = duration.to_f / trace_duration * 100

    s_start = ::Mnemosyne::Clock.to_tick self.start
    t_start = ::Mnemosyne::Clock.to_tick trace.start

    offset = s_start - t_start
    offset = offset.to_f / trace_duration * 100

    "width: #{width}%; margin-left: #{offset}%"
  end
end