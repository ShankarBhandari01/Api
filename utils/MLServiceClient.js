import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.resolve("grpc/protos/ml_service.proto");

class MLServiceClient {
  constructor({ grpcAddress = "localhost:50051" } = {}) {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const mlProto = grpc.loadPackageDefinition(packageDefinition).ml;

    if (!mlProto?.MLService) {
      throw new Error("MLService not found in loaded proto definition.");
    }

    this.client = new mlProto.MLService(
      grpcAddress,
      grpc.credentials.createInsecure()
    );
  }

  async predict(request) {
    return new Promise((resolve, reject) => {
      this.client.Predict(request, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }
}

export default MLServiceClient;
