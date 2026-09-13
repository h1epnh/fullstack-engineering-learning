from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.functions import FlatMapFunction
from pyflink.common.typeinfo import Types

class Tokenizer(FlatMapFunction):
    def flat_map(self, value):
        for token in value.lower().split():
            yield token, 1

def word_count():
    env = StreamExecutionEnvironment.get_execution_environment()

    # get input data by connecting to the socket
    text = env.socket_text_stream("localhost", 9999)

    # parse the data, group it, window it, and aggregate the counts
    counts = text.flat_map(Tokenizer(), output_type=Types.TUPLE([Types.STRING(), Types.INT()])) \
                 .key_by(lambda x: x[0]) \
                 .sum(1)

    # print the results with a single thread, rather than in parallel
    counts.print()

    env.execute("Socket Window WordCount")

if __name__ == '__main__':
    word_count()